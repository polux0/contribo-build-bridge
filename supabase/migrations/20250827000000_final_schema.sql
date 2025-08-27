-- Migration: Final Schema Consolidation
-- Description: Clean, final schema with all necessary tables for both local and production
-- Date: 2025-08-27

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create resumes bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Create job_descriptions bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job_descriptions',
  'job_descriptions',
  false,
  10485760, -- 10MB in bytes
  ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Drop existing storage policies
-- DROP POLICY IF EXISTS "Authenticated users can upload resumes" ON storage.objects;
-- DROP POLICY IF EXISTS "Authenticated users can upload job descriptions" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view own resumes" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view own job descriptions" ON storage.objects;

-- -- Create storage policies for resumes bucket - allow anyone to upload
-- CREATE POLICY "Anyone can upload resumes" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'resumes');

-- CREATE POLICY "Anyone can view resumes" ON storage.objects
-- FOR SELECT USING (bucket_id = 'resumes');

-- -- Create storage policies for job_descriptions bucket - allow anyone to upload
-- CREATE POLICY "Anyone can upload job descriptions" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'job_descriptions');

-- CREATE POLICY "Anyone can view job descriptions" ON storage.objects
-- FOR SELECT USING (bucket_id = 'job_descriptions');

-- ============================================================================
-- PROFILES TABLE (Supports both Supabase and Privy auth)
-- ============================================================================

-- Drop existing profiles table if it exists
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Create the final profiles table
CREATE TABLE public.profiles (
    id text PRIMARY KEY, -- text to support both UUID and Privy user IDs
    user_id text, -- Supabase auth user ID (nullable for Privy users)
    privy_user_id text, -- Privy user ID (nullable for Supabase users)
    email text,
    name text,
    avatar_url text,
    github_username text,
    linkedin_profile text,
    google_profile text, -- Google profile information
    wallet_address text,
    wallet_type text,
    auth_provider text DEFAULT 'supabase', -- 'supabase' or 'privy'
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- ============================================================================
-- OPPORTUNITIES TABLE
-- ============================================================================

-- Drop existing opportunities table if it exists
DROP TABLE IF EXISTS public.opportunities CASCADE;

-- Create the final opportunities table
CREATE TABLE public.opportunities (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    company_name text NOT NULL,
    title text NOT NULL,
    short_desc text NOT NULL,
    long_description_url text NULL,
    repo_url text NOT NULL,
    issue_url text NOT NULL,
    payout_token text NOT NULL,
    payout_amount numeric(10,2) NOT NULL,
    chain_id integer NOT NULL,
    deadline timestamp with time zone NOT NULL,
    status text NOT NULL DEFAULT 'open',
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT opportunities_pkey PRIMARY KEY (id),
    CONSTRAINT opportunities_status_chk CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled'))
);

-- ============================================================================
-- APPLICATIONS TABLE
-- ============================================================================

-- Drop existing applications table if it exists
DROP TABLE IF EXISTS public.applications CASCADE;
DROP TABLE IF EXISTS public.application_audit CASCADE;

-- Create the final applications table
CREATE TABLE public.applications (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id uuid NOT NULL,
    user_id text NOT NULL, -- profiles table PK (text for Privy users)
    payload jsonb NOT NULL DEFAULT '{}'::jsonb, -- github/link(s)/note/contact
    status text NOT NULL DEFAULT 'submitted', -- submitted|under_review|accepted|rejected|withdrawn
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT applications_status_chk CHECK (status IN ('submitted','under_review','accepted','rejected','withdrawn'))
);

-- Foreign keys
ALTER TABLE public.applications
    ADD CONSTRAINT applications_opportunity_fk
    FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id)
    ON DELETE CASCADE;

ALTER TABLE public.applications
    ADD CONSTRAINT applications_user_fk
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE RESTRICT;

-- ============================================================================
-- RESUMES TABLE (for job seekers)
-- ============================================================================

-- Drop existing resumes table if it exists
DROP TABLE IF EXISTS public.resumes CASCADE;

-- Create the final resumes table
CREATE TABLE public.resumes (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL, -- profiles table PK (text for Privy users)
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size integer NULL,
    mime_type text NULL,
    email text NULL,
    public_url text NULL,
    uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT resumes_pkey PRIMARY KEY (id)
);

-- Foreign key to profiles
ALTER TABLE public.resumes
    ADD CONSTRAINT resumes_user_fk
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- ============================================================================
-- JOB_DESCRIPTIONS TABLE (for hiring companies)
-- ============================================================================

-- Drop existing job_descriptions table if it exists
DROP TABLE IF EXISTS public.job_descriptions CASCADE;

-- Create the final job_descriptions table
CREATE TABLE public.job_descriptions (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    user_id text NOT NULL, -- profiles table PK (text for Privy users)
    filename text NOT NULL,
    file_path text NOT NULL,
    file_size integer NULL,
    mime_type text NULL,
    email text NULL,
    public_url text NULL,
    uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT job_descriptions_pkey PRIMARY KEY (id)
);

-- Foreign key to profiles
ALTER TABLE public.job_descriptions
    ADD CONSTRAINT job_descriptions_user_fk
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_github_username ON public.profiles(github_username);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON public.profiles(auth_provider);

-- Opportunities indexes
CREATE INDEX IF NOT EXISTS idx_opportunities_company_name ON public.opportunities(company_name);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON public.opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_deadline ON public.opportunities(deadline);
CREATE INDEX IF NOT EXISTS idx_opportunities_chain_id ON public.opportunities(chain_id);

-- Applications indexes
CREATE INDEX IF NOT EXISTS idx_applications_opportunity ON public.applications(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_applications_user ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON public.applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON public.applications(created_at DESC);

-- Resumes indexes
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_email ON public.resumes(email);

-- Job descriptions indexes
CREATE INDEX IF NOT EXISTS idx_job_descriptions_email ON public.job_descriptions(email);
CREATE INDEX IF NOT EXISTS idx_job_descriptions_user_id ON public.job_descriptions(user_id);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at 
    BEFORE UPDATE ON public.profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_opportunities_updated_at 
    BEFORE UPDATE ON public.opportunities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
    BEFORE UPDATE ON public.applications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- RLS CONFIGURATION - DISABLE FOR USER TABLES
-- ============================================================================

-- Drop ALL existing policies for user-related tables
DO $$ 
BEGIN
    -- Drop policies for profiles
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Service role can do everything" ON public.profiles;
    
    -- Drop policies for applications
    DROP POLICY IF EXISTS "Users can view own applications" ON public.applications;
    DROP POLICY IF EXISTS "Users can create own applications" ON public.applications;
    DROP POLICY IF EXISTS "Users can update own submitted applications" ON public.applications;
    DROP POLICY IF EXISTS "Service role can do everything" ON public.applications;
    
    -- Drop policies for resumes
    DROP POLICY IF EXISTS "Users can view own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can create own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can update own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Users can delete own resumes" ON public.resumes;
    DROP POLICY IF EXISTS "Service role can do everything" ON public.resumes;
    
    RAISE NOTICE 'All existing policies dropped';
END $$;

-- Explicitly disable RLS on user-related tables
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_descriptions DISABLE ROW LEVEL SECURITY;

-- Enable RLS only on opportunities (keep this secure)
ALTER TABLE public.opportunities ENABLE ROW LEVEL SECURITY;

-- Opportunities policies (public read, authenticated create)
CREATE POLICY "Anyone can view opportunities" ON public.opportunities FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create opportunities" ON public.opportunities FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Service role can do everything" ON public.opportunities FOR ALL USING (auth.role() = 'service_role');

-- Verify RLS status
DO $$
DECLARE
    rls_status text;
BEGIN
    -- Check profiles table
    SELECT CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END INTO rls_status
    FROM pg_class WHERE relname = 'profiles' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    RAISE NOTICE 'Profiles table RLS: %', rls_status;
    
    -- Check applications table
    SELECT CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END INTO rls_status
    FROM pg_class WHERE relname = 'applications' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    RAISE NOTICE 'Applications table RLS: %', rls_status;
    
    -- Check resumes table
    SELECT CASE WHEN relrowsecurity THEN 'ENABLED' ELSE 'DISABLED' END INTO rls_status
    FROM pg_class WHERE relname = 'resumes' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
    RAISE NOTICE 'Resumes table RLS: %', rls_status;
END $$;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.profiles IS 'User profile information supporting both Supabase and Privy authentication';
COMMENT ON TABLE public.opportunities IS 'Gig opportunities and tasks posted by companies';
COMMENT ON TABLE public.applications IS 'Job applications submitted by users for opportunities';
COMMENT ON TABLE public.resumes IS 'Resume files uploaded by job seekers';
COMMENT ON TABLE public.job_descriptions IS 'Job description files uploaded by hiring companies';

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant permissions to authenticated users
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.opportunities TO authenticated;
GRANT ALL ON public.applications TO authenticated;
GRANT ALL ON public.resumes TO authenticated;
GRANT ALL ON public.job_descriptions TO authenticated;

-- Grant permissions to service role
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.opportunities TO service_role;
GRANT ALL ON public.applications TO service_role;
GRANT ALL ON public.resumes TO service_role;
GRANT ALL ON public.job_descriptions TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;
