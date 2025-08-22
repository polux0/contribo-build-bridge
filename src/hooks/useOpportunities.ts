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
      try {
        setLoading(true);
        setError(null);

        const { data, error } = await supabase
          .from('opportunities')
          .select('*')
          .eq('status', 'open')
          .order('created_at', { ascending: false });

        if (error) {
          throw error;
        }

        setOpportunities(data || []);
      } catch (err) {
        console.error('Error fetching opportunities:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch opportunities');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  return { opportunities, loading, error };
}; 