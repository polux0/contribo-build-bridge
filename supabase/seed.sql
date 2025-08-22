-- Seed file: Sample data for development
-- This file is automatically loaded when running supabase db reset

-- Insert sample opportunities
INSERT INTO public.opportunities (
  company_name,
  title,
  short_desc,
  long_description_url,
  repo_url,
  issue_url,
  payout_token,
  payout_amount,
  chain_id,
  deadline,
  status
) VALUES 
(
  'CollabBerry',
  'Token & Stablecoin Payout Automation via SAFE Multisig',
  'Build a secure, batched payout system using Gnosis Safe multisig. Automate distributions of stablecoins and recognition tokens based on evaluation outputs, integrate with Safe SDK and Transaction Service, and enable admin previews & status tracking - fully aligned with our Functional Specification.',
  'https://notion.so/collabberry-payout-automation-spec',
  'https://github.com/collabberry/backend',
  'https://github.com/collabberry/backend/issues/123',
  'USDC',
  3200,
  42161,
  '2025-09-23',
  'open'
);