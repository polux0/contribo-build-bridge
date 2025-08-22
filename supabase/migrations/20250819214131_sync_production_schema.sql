-- Migration: Sync Production Schema
-- Description: Sync local database with production schema
-- Tables: profiles, job_descriptions, resumes

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  email text NULL,
  name text NULL,
  github_username text NULL,
  linkedin_profile text NULL,
  avatar_url text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_key UNIQUE (user_id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Create job_descriptions table
CREATE TABLE public.job_descriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer NULL,
  mime_type text NULL,
  email text NULL,
  public_url text NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT job_descriptions_pkey PRIMARY KEY (id)
);

-- Create resumes table
CREATE TABLE public.resumes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  filename text NOT NULL,
  file_path text NOT NULL,
  file_size integer NULL,
  mime_type text NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now(),
  email text NULL,
  public_url text NULL,
  CONSTRAINT resumes_pkey PRIMARY KEY (id),
  CONSTRAINT resumes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Add comments for documentation
COMMENT ON TABLE public.profiles IS 'User profile information linked to auth.users';
COMMENT ON TABLE public.job_descriptions IS 'Job description files uploaded by users';
COMMENT ON TABLE public.resumes IS 'Resume files uploaded by users';

-- Add indexes for better performance (if they exist in production)
-- Uncomment these if you have them in production:
-- CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
-- CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
-- CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
-- CREATE INDEX IF NOT EXISTS idx_job_descriptions_email ON public.job_descriptions(email);
