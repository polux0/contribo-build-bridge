-- Migration: Create Opportunities Table
-- Description: Create table to store gig opportunities and tasks
-- Date: 2025-08-20

-- Create opportunities table
CREATE TABLE public.opportunities (
  id text NOT NULL,
  company_id text NOT NULL,
  title text NOT NULL,
  short_desc text NOT NULL,
  long_desc text NULL,
  repo_url text NOT NULL,
  issue_url text NOT NULL,
  payout_token text NOT NULL,
  payout_amount numeric(10,2) NOT NULL,
  chain_id integer NOT NULL,
  deadline timestamp with time zone NOT NULL,
  status text NOT NULL DEFAULT 'open',
  labels text[] NOT NULL DEFAULT '{}',
  acceptance_json jsonb NOT NULL DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT opportunities_pkey PRIMARY KEY (id)
);

-- Add comments for documentation
COMMENT ON TABLE public.opportunities IS 'Gig opportunities and tasks posted by companies';
COMMENT ON COLUMN public.opportunities.id IS 'Unique identifier for the opportunity';
COMMENT ON COLUMN public.opportunities.company_id IS 'Identifier for the company posting the opportunity';
COMMENT ON COLUMN public.opportunities.title IS 'Title of the opportunity';
COMMENT ON COLUMN public.opportunities.short_desc IS 'Short description of the task';
COMMENT ON COLUMN public.opportunities.long_desc IS 'Detailed description with diagrams, requirements, etc.';
COMMENT ON COLUMN public.opportunities.repo_url IS 'URL to the GitHub repository';
COMMENT ON COLUMN public.opportunities.issue_url IS 'URL to the GitHub issue';
COMMENT ON COLUMN public.opportunities.payout_token IS 'Token used for payout (e.g., USDC, ETH)';
COMMENT ON COLUMN public.opportunities.payout_amount IS 'Amount to be paid for completing the task';
COMMENT ON COLUMN public.opportunities.chain_id IS 'Blockchain network ID (e.g., 8453 for Base)';
COMMENT ON COLUMN public.opportunities.deadline IS 'Deadline for completing the task';
COMMENT ON COLUMN public.opportunities.status IS 'Current status (open, in_progress, completed, cancelled)';
COMMENT ON COLUMN public.opportunities.labels IS 'Array of labels for categorizing the opportunity';
COMMENT ON COLUMN public.opportunities.acceptance_json IS 'JSON object containing acceptance criteria';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_opportunities_company_id ON public.opportunities(company_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_chain_id ON public.opportunities(chain_id);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON public.opportunities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
