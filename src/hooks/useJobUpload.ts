
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { toast } from '@/hooks/use-toast';

export const useJobUpload = () => {
  const [uploading, setUploading] = useState(false);
  const { user } = useUnifiedAuth();

  const uploadJobDescription = async (file: File, email?: string) => {
    console.log('🚀 Starting job description upload...');
    console.log('👤 Current user:', user);
    console.log('📁 File to upload:', file);
    console.log('📧 Email provided:', email);

    if (!user) {
      console.log('❌ No user found, showing auth required toast');
      toast({
        title: "Authentication required",
        description: "Please sign in to upload your job description.",
        variant: "destructive",
      });
      return false;
    }

    console.log('✅ User authenticated, proceeding with upload');
    console.log('🆔 User ID:', user.id);
    console.log('📧 User email:', user.email);

    setUploading(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      console.log('📤 Uploading job description file to storage:', fileName);
      
      // Upload file to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('job_descriptions')
        .upload(fileName, file);

      if (uploadError) {
        console.log('❌ Storage upload error:', uploadError);
        throw uploadError;
      }

      console.log('✅ Job description uploaded to storage successfully:', uploadData);

      // Get the public URL for the file
      const { data: urlData } = supabase.storage
        .from('job_descriptions')
        .getPublicUrl(uploadData.path);

      console.log('🔗 Public URL generated:', urlData.publicUrl);

      // Save job description info to database
      const jobDescriptionData = {
        user_id: user.id,
        filename: file.name,
        file_path: uploadData.path,
        file_size: file.size,
        mime_type: file.type,
        email: email || user.email,
        public_url: urlData.publicUrl,
      };

      console.log('💾 Saving job description data to database:', jobDescriptionData);

      // First, let's check if the user profile exists
      console.log('🔍 Checking if user profile exists...');
      const { data: profileCheck, error: profileError } = await supabase
        .from('profiles')
        .select('id, email, auth_provider')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.log('❌ Profile check error:', profileError);
      } else {
        console.log('✅ Profile found:', profileCheck);
      }

      const { error: dbError } = await supabase
        .from('job_descriptions')
        .insert(jobDescriptionData);

      if (dbError) {
        console.log('❌ Database insert error:', dbError);
        console.log('🔍 Error details:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        });
        throw dbError;
      }

      console.log('✅ Job description saved to database successfully');

      toast({
        title: "Job description uploaded successfully",
        description: "Your job description has been saved and can be used to find talent.",
      });

      return true;
    } catch (error) {
      console.error('❌ Error uploading job description:', error);
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
