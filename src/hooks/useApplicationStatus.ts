import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { devLog, devError } from '@/lib/utils';

interface ApplicationStatus {
  hasApplied: boolean;
  applicationId?: string;
  status?: string;
  appliedAt?: string;
}

export const useApplicationStatus = (opportunityId?: string) => {
  const { user } = useUnifiedAuth();
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus>({
    hasApplied: false
  });
  const [loading, setLoading] = useState(false);

  const checkApplicationStatus = useCallback(async () => {
    if (!user || !opportunityId) {
      setApplicationStatus({ hasApplied: false });
      return;
    }

    setLoading(true);
    try {
      devLog('🔍 Checking application status for:', {
        opportunityId,
        userId: user.id
      });

      const { data, error } = await supabase
        .from('applications')
        .select('id, status, created_at')
        .eq('opportunity_id', opportunityId)
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        devError('❌ Error checking application status:', error);
        setApplicationStatus({ hasApplied: false });
        return;
      }

      if (data) {
        devLog('✅ Found existing application:', data);
        setApplicationStatus({
          hasApplied: true,
          applicationId: data.id,
          status: data.status,
          appliedAt: data.created_at
        });
      } else {
        devLog('✅ No existing application found');
        setApplicationStatus({ hasApplied: false });
      }
    } catch (error) {
      devError('❌ Error checking application status:', error);
      setApplicationStatus({ hasApplied: false });
    } finally {
      setLoading(false);
    }
  }, [user, opportunityId]);

  useEffect(() => {
    checkApplicationStatus();
  }, [checkApplicationStatus]);

  return {
    applicationStatus,
    loading,
    refetch: checkApplicationStatus
  };
}; 