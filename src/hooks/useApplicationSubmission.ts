import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { toast } from '@/hooks/use-toast';
import { devLog, devError } from '@/lib/utils';

interface ApplicationData {
  opportunity_id: string;
  payload?: Record<string, any>;
}

export const useApplicationSubmission = () => {
  const { user } = useUnifiedAuth();

  const submitApplication = useCallback(async (applicationData: ApplicationData, onSuccess?: () => void) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit an application.",
        variant: "destructive",
      });
      return false;
    }

    try {
      devLog('🔍 Submitting application:', {
        opportunity_id: applicationData.opportunity_id,
        user_id: user.id,
        payload: applicationData.payload
      });

      const { data, error } = await supabase
        .from('applications')
        .insert({
          opportunity_id: applicationData.opportunity_id,
          user_id: user.id,
          payload: applicationData.payload || {},
          status: 'submitted'
        })
        .select()
        .single();

      if (error) {
        devError('❌ Error submitting application:', error);
        toast({
          title: "Submission failed",
          description: "Failed to submit your application. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      devLog('✅ Application submitted successfully:', data);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
      
      return true;
    } catch (error) {
      devError('❌ Error submitting application:', error);
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  }, [user]);

  return {
    submitApplication
  };
}; 