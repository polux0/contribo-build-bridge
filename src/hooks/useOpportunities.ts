import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Opportunity {
  id: string;
  company_name: string;
  title: string;
  short_desc: string;
  long_description_url: string | null;
  repo_url: string;
  issue_url: string;
  payout_token: string;
  payout_amount: number;
  chain_id: number;
  deadline: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useOpportunities = () => {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      console.log('🔍 useOpportunities: Starting to fetch opportunities...');
      
      try {
        setLoading(true);
        setError(null);

        // Add timeout to prevent infinite loading - reduced to 2 seconds
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout after 2 seconds')), 2000); // Changed from 10000 to 2000
        });

        const queryPromise = supabase
          .from('opportunities')
          .select('*');

        console.log('🔍 useOpportunities: Fetching all opportunities...');
        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

        console.log('🔍 useOpportunities: Query result:', { data, error });

        if (error) {
          console.error('❌ useOpportunities: Query error:', error);
          throw error;
        }

        console.log('✅ useOpportunities: Successfully fetched opportunities:', data);
        setOpportunities(data || []);
      } catch (err) {
        console.error('❌ useOpportunities: Error fetching opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      } finally {
        console.log('🔍 useOpportunities: Setting loading to false');
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  console.log('🔍 useOpportunities: Current state:', { opportunities, loading, error });
  return { opportunities, loading, error };
}; 