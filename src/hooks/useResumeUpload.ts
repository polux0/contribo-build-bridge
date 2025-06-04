
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useResumeUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const uploadResume = async (file: File) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upload your resume.",
        variant: "destructive",
      });
      return false;
    }

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Save file info to database
      const { error: dbError } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
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

  return { uploadResume, uploading };
};
