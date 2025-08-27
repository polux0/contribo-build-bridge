import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { toast } from '@/hooks/use-toast';
import { devLog } from '@/lib/utils';

export const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useUnifiedAuth();

  const uploadResume = async (file: File) => {
    devLog('🚀 Starting resume upload...');
    devLog('👤 Current user:', user);
    devLog('📁 File to upload:', file);

    if (!user) {
      devLog('❌ No user found, showing auth required toast');
      toast({
        title: "Authentication required",
        description: "Please sign in to upload your resume.",
        variant: "destructive",
      });
      return false;
    }

    devLog('✅ User authenticated, proceeding with upload');
    devLog('🆔 User ID:', user.id);
    devLog('📧 User email:', user.email);

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      devLog('📤 Uploading file to storage:', fileName);
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        devLog('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      devLog('✅ File uploaded to storage successfully:', uploadData);

      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(uploadData.path);

      devLog('🔗 Public URL generated:', urlData.publicUrl);

      // Save file info to database
      const resumeData = {
        user_id: user.id,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        email: user.email,
        public_url: urlData.publicUrl,
      };

      devLog('💾 Saving resume data to database:', resumeData);

      // First, let's check if the user profile exists
      devLog('🔍 Checking if user profile exists...');
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, auth_provider')
        .eq('id', user.id)
        .single();

      if (profileError) {
        devLog('❌ Profile check error:', profileError);
      } else {
        devLog('✅ Profile found:', profileCheck);
      }

      const { error: dbError } = await supabase
        .from('resumes')
        .insert(resumeData);

      if (dbError) {
        devLog('❌ Database insert error:', dbError);
        devLog('🔍 Error details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        });
        throw dbError;
      }

      devLog('✅ Resume saved to database successfully');

      toast({
        title: "Resume uploaded successfully",
        description: "Your resume has been saved and can be analyzed for job matches.",
      });

      return true;
    } catch (error) {
      devError('❌ Error uploading resume:', error);
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
      devError('Error getting resume URL:', error);
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
      devError('Error downloading resume:', error);
      toast({
        title: "Download failed",
        description: "There was an error downloading the resume.",
        variant: "destructive",
      });
    }
  };

  return { uploadResume, uploading, getResumeUrl, downloadResume };
};
