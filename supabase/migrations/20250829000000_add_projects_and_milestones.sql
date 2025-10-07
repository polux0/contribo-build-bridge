-- Migration: Add Projects and Milestones Tables
-- Description: Schema for storing project creation flow data
-- Date: 2025-08-29

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================

-- Drop existing projects table if it exists
DROP TABLE IF EXISTS public.projects CASCADE;

-- Create the projects table
CREATE TABLE public.projects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id text NOT NULL, -- profiles table PK (text for Privy users)
    
    -- Basic project info
    title text NOT NULL,
    description text NOT NULL,
    
    -- Project settings
    total_budget numeric(10,2) NOT NULL,
    total_timeline_days integer NOT NULL,
    currency text NOT NULL DEFAULT 'USDC',
    complexity text NOT NULL DEFAULT 'medium',
    
    -- Context & inputs
    repo_url text,
    design_link text,
    dependencies text,
    uploaded_files jsonb DEFAULT '[]'::jsonb,
    
    -- Status and metadata
    status text NOT NULL DEFAULT 'draft', -- draft, published, completed, cancelled
    published_at timestamp with time zone,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT projects_status_chk CHECK (status IN ('draft', 'published', 'completed', 'cancelled')),
    CONSTRAINT projects_currency_chk CHECK (currency IN ('USDC', 'USDT')),
    CONSTRAINT projects_complexity_chk CHECK (complexity IN ('low', 'medium', 'high'))
);

-- ============================================================================
-- MILESTONES TABLE
-- ============================================================================

-- Drop existing milestones table if it exists
DROP TABLE IF EXISTS public.milestones CASCADE;

-- Create the milestones table
CREATE TABLE public.milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id uuid NOT NULL,
    
    -- Milestone details
    title text NOT NULL,
    outcome text NOT NULL,
    proof_requirements text NOT NULL, -- GitHub proof requirements
    video_requirements text NOT NULL, -- Video proof requirements
    
    -- Timeline and rewards
    timeline_days integer NOT NULL,
    reward_amount numeric(10,2) NOT NULL,
    currency text NOT NULL DEFAULT 'USDC',
    payout_percentage numeric(5,2) NOT NULL, -- e.g., 25.00 for 25%
    
    -- Dates
    start_date date,
    end_date date,
    
    -- Ordering
    order_index integer NOT NULL,
    
    -- Status
    status text NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    completed_at timestamp with time zone,
    
    -- Metadata
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    
    -- Constraints
    CONSTRAINT milestones_status_chk CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
    CONSTRAINT milestones_currency_chk CHECK (currency IN ('USDC', 'USDT')),
    CONSTRAINT milestones_payout_chk CHECK (payout_percentage >= 0 AND payout_percentage <= 100)
);

-- ============================================================================
-- FOREIGN KEYS
-- ============================================================================

-- Projects -> Profiles
ALTER TABLE public.projects
    ADD CONSTRAINT projects_user_fk
    FOREIGN KEY (user_id) REFERENCES public.profiles(id)
    ON DELETE CASCADE;

-- Milestones -> Projects
ALTER TABLE public.milestones
    ADD CONSTRAINT milestones_project_fk
    FOREIGN KEY (project_id) REFERENCES public.projects(id)
    ON DELETE CASCADE;

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Projects indexes
CREATE INDEX idx_projects_user_id ON public.projects(user_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_projects_created_at ON public.projects(created_at);

-- Milestones indexes
CREATE INDEX idx_milestones_project_id ON public.milestones(project_id);
CREATE INDEX idx_milestones_status ON public.milestones(status);
CREATE INDEX idx_milestones_order ON public.milestones(project_id, order_index);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on projects table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Projects policies
CREATE POLICY "Users can view their own projects" ON public.projects
    FOR SELECT USING (auth.uid()::text = user_id OR user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
    ));

CREATE POLICY "Users can insert their own projects" ON public.projects
    FOR INSERT WITH CHECK (auth.uid()::text = user_id OR user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
    ));

CREATE POLICY "Users can update their own projects" ON public.projects
    FOR UPDATE USING (auth.uid()::text = user_id OR user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
    ));

CREATE POLICY "Users can delete their own projects" ON public.projects
    FOR DELETE USING (auth.uid()::text = user_id OR user_id IN (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
    ));

-- Enable RLS on milestones table
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

-- Milestones policies (inherit from projects)
CREATE POLICY "Users can view milestones of their projects" ON public.milestones
    FOR SELECT USING (project_id IN (
        SELECT id FROM public.projects WHERE auth.uid()::text = user_id OR user_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can insert milestones to their projects" ON public.milestones
    FOR INSERT WITH CHECK (project_id IN (
        SELECT id FROM public.projects WHERE auth.uid()::text = user_id OR user_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can update milestones of their projects" ON public.milestones
    FOR UPDATE USING (project_id IN (
        SELECT id FROM public.projects WHERE auth.uid()::text = user_id OR user_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    ));

CREATE POLICY "Users can delete milestones of their projects" ON public.milestones
    FOR DELETE USING (project_id IN (
        SELECT id FROM public.projects WHERE auth.uid()::text = user_id OR user_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    ));

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to create project with milestones in a transaction
CREATE OR REPLACE FUNCTION create_project_with_milestones(
    p_user_id text,
    p_title text,
    p_description text,
    p_total_budget numeric,
    p_total_timeline_days integer,
    p_currency text,
    p_complexity text,
    p_repo_url text DEFAULT NULL,
    p_design_link text DEFAULT NULL,
    p_dependencies text DEFAULT NULL,
    p_uploaded_files jsonb DEFAULT '[]'::jsonb,
    p_milestones jsonb DEFAULT '[]'::jsonb
) RETURNS uuid AS $$
DECLARE
    project_uuid uuid;
    milestone_data jsonb;
    milestone_record jsonb;
BEGIN
    -- Insert project
    INSERT INTO public.projects (
        user_id, title, description, total_budget, total_timeline_days,
        currency, complexity, repo_url, design_link, dependencies, uploaded_files
    ) VALUES (
        p_user_id, p_title, p_description, p_total_budget, p_total_timeline_days,
        p_currency, p_complexity, p_repo_url, p_design_link, p_dependencies, p_uploaded_files
    ) RETURNING id INTO project_uuid;
    
    -- Insert milestones
    FOR milestone_record IN SELECT * FROM jsonb_array_elements(p_milestones)
    LOOP
        INSERT INTO public.milestones (
            project_id, title, outcome, proof_requirements, video_requirements,
            timeline_days, reward_amount, currency, payout_percentage,
            start_date, end_date, order_index
        ) VALUES (
            project_uuid,
            milestone_record->>'title',
            milestone_record->>'outcome',
            milestone_record->>'proof',
            milestone_record->>'videoDescription',
            (milestone_record->>'timeline')::integer,
            (milestone_record->>'rewardAmount')::numeric,
            milestone_record->>'currency',
            (milestone_record->>'payout')::numeric,
            (milestone_record->>'startDate')::date,
            (milestone_record->>'endDate')::date,
            (milestone_record->>'orderIndex')::integer
        );
    END LOOP;
    
    RETURN project_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update project status
CREATE OR REPLACE FUNCTION update_project_status(
    p_project_id uuid,
    p_status text
) RETURNS boolean AS $$
BEGIN
    UPDATE public.projects 
    SET status = p_status, 
        published_at = CASE WHEN p_status = 'published' THEN now() ELSE published_at END,
        updated_at = now()
    WHERE id = p_project_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
