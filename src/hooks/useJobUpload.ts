
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useJobUpload = () => {
  const [uploading, setUploading] = useState(false);

  const uploadJobDescription = async (file: File, email?: string) => {
    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `job-descriptions/${Date.now()}.${fileExt}`;
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job-descriptions')
        .upload(fileName, file);

      if (uploadError) {
        throw uploadError;
      }

      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('job-descriptions')
        .getPublicUrl(uploadData.path);

      // Save job description info to database
      const { error: dbError } = await supabase
        .from('job_descriptions')
        .insert({
          filename: file.name,
          file_path: uploadData.path,
          file_size: file.size,
          mime_type: file.type,
          email: email,
          public_url: urlData.publicUrl,
        });

      if (dbError) {
        throw dbError;
      }

      toast({
        title: "Job description uploaded successfully",
        description: "Your job description has been saved and can be used to find talent.",
      });

      return true;
    } catch (error) {
      console.error('Error uploading job description:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your job description. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setUploading(false);
    }
  };

  return { uploadJobDescription, uploading };
};
