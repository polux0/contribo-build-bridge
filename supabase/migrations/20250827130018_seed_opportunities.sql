-- Seed opportunities data
-- This migration ensures sample opportunities are always available

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
  'https://elderly-accordion-7b3.notion.site/Functional-Specification-Token-Payments-via-SAFE-Multisig-1-2426b904fab281e78af2f551c57c12ec?source=copy_link',
  'https://github.com/collabberry/backend',
  'https://github.com/collabberry/backend/issues/98',
  'USDC',
  3200,
  42161,
  '2025-09-23',
  'open'
);
