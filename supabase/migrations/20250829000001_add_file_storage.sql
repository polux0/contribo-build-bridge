-- Migration: Add File Storage for Project Files
-- Description: Creates Supabase Storage bucket and policies for project file uploads
-- Date: 2025-08-29

-- ============================================================================
-- STORAGE BUCKET CREATION
-- ============================================================================

-- Create the storage bucket for project files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'project-files',
    'project-files',
    true, -- Public bucket so files can be accessed via URL
    10485760, -- 10MB file size limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'text/plain', 'text/plain;charset=UTF-8', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
);

-- ============================================================================
-- STORAGE POLICIES
-- ============================================================================

-- Policy: Users can upload files to their own project folders
CREATE POLICY "Users can upload files to their projects" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'project-files' AND
        auth.uid()::text IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Users can view files from their own projects
CREATE POLICY "Users can view files from their projects" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'project-files' AND
        (
            -- Owner can view their files
            auth.uid()::text IN (
                SELECT user_id FROM public.profiles WHERE user_id = auth.uid()::text
            ) OR
            -- Or if the file belongs to a project they own
            (storage.foldername(name))[2] IN (
                SELECT id::text FROM public.projects WHERE user_id = auth.uid()::text
            )
        )
    );

-- Policy: Users can update files in their own projects
CREATE POLICY "Users can update files in their projects" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'project-files' AND
        auth.uid()::text IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    );

-- Policy: Users can delete files from their own projects
CREATE POLICY "Users can delete files from their projects" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'project-files' AND
        auth.uid()::text IN (
            SELECT user_id FROM public.profiles WHERE user_id = auth.uid()::text
        )
    );

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get file URL from storage
CREATE OR REPLACE FUNCTION get_file_url(bucket_name text, file_path text)
RETURNS text AS $$
BEGIN
    RETURN format('https://%s/storage/v1/object/public/%s/%s', 
        current_setting('app.settings.api_url', true), 
        bucket_name, 
        file_path
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up files when project is deleted
CREATE OR REPLACE FUNCTION cleanup_project_files()
RETURNS TRIGGER AS $$
BEGIN
    -- Delete all files in the project folder
    DELETE FROM storage.objects 
    WHERE bucket_id = 'project-files' 
    AND (storage.foldername(name))[2] = OLD.id::text;
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to clean up files when project is deleted
CREATE TRIGGER cleanup_project_files_trigger
    AFTER DELETE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION cleanup_project_files();

-- ============================================================================
-- UPDATE PROJECTS TABLE SCHEMA
-- ============================================================================

-- Add a comment to the uploaded_files column to clarify its new purpose
COMMENT ON COLUMN public.projects.uploaded_files IS 'JSON array of file metadata with URLs from Supabase Storage';
