
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadResume = async (file: File, email?: string) => {
    if (!user && !email) {
      toast({
        title: "Email required",
        description: "Please provide your email to upload your resume.",
        variant: "destructive",
      });
      return false;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const userId = user?.id || 'anonymous';
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(uploadData.path);

      // Save file info to database
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user?.id || null,
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          email: email || user?.email,
          public_url: urlData.publicUrl,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been saved and can be analyzed for job matches.",
      });

      return true;
    } catch (error) {
      console.error('Error uploading resume:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your resume. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  const getResumeUrl = async (filePath: string) => {
    try {
      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(filePath);
      
      return data.publicUrl;
    } catch (error) {
      console.error('Error getting resume URL:', error);
      return null;
    }
  };

  const downloadResume = async (filePath: string, filename: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .download(filePath);

      if (error) throw error;

      // Create a download link
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading resume:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the resume.",
        variant: "destructive",
      });
    }
  };

  return { uploadResume, uploading, getResumeUrl, downloadResume };
};
