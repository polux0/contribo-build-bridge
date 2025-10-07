import { supabase } from '@/integrations/supabase/client';

export interface FileUploadResult {
  success: boolean;
  fileUrl?: string;
  error?: string;
}

export interface SerializedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  url?: string;
}

/**
 * Upload a file to Supabase Storage
 */
export async function uploadFileToStorage(
  file: File,
  projectId: string,
  userId: string
): Promise<FileUploadResult> {
  try {
    // Create a unique filename to avoid conflicts
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = `projects/${projectId}/${fileName}`;

    console.log('Uploading file to storage:', { fileName, filePath, size: file.size });

    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from('project-files')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading file:', error);
      return { success: false, error: error.message };
    }

    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('project-files')
      .getPublicUrl(filePath);

    console.log('File uploaded successfully:', urlData.publicUrl);

    return {
      success: true,
      fileUrl: urlData.publicUrl
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Upload multiple files to Supabase Storage
 */
export async function uploadFilesToStorage(
  files: File[],
  projectId: string,
  userId: string
): Promise<{ success: boolean; files: SerializedFile[]; errors: string[] }> {
  const results: SerializedFile[] = [];
  const errors: string[] = [];

  for (const file of files) {
    const uploadResult = await uploadFileToStorage(file, projectId, userId);
    
    if (uploadResult.success && uploadResult.fileUrl) {
      results.push({
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified,
        url: uploadResult.fileUrl
      });
    } else {
      errors.push(`Failed to upload ${file.name}: ${uploadResult.error}`);
    }
  }

  return {
    success: errors.length === 0,
    files: results,
    errors
  };
}

/**
 * Delete a file from Supabase Storage
 */
export async function deleteFileFromStorage(filePath: string): Promise<FileUploadResult> {
  try {
    const { error } = await supabase.storage
      .from('project-files')
      .remove([filePath]);

    if (error) {
      console.error('Error deleting file:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting file:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Get file URL from storage path
 */
export function getFileUrl(filePath: string): string {
  const { data } = supabase.storage
    .from('project-files')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
}
