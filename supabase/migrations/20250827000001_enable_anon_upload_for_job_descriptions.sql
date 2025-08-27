-- ============================================================================
-- SIMPLE: allow anon uploads to the job_descriptions bucket (no path constraint)
-- Keeps bucket private: no public read/list without a policy.
-- ============================================================================

-- Ensure bucket exists (won't overwrite your current settings)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'job_descriptions',
  'job_descriptions',
  false, -- keep private
  10485760,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Clean prior policies that might conflict
DROP POLICY IF EXISTS "jd_anon_upload" ON storage.objects;
DROP POLICY IF EXISTS "jd_select_any"  ON storage.objects;
DROP POLICY IF EXISTS "jd_select_own"  ON storage.objects;
DROP POLICY IF EXISTS "jd_update_own"  ON storage.objects;
DROP POLICY IF EXISTS "jd_delete_own"  ON storage.objects;

-- Allow anyone with anon key to UPLOAD into this bucket.
-- Bucket's allowed_mime_types + file_size_limit are enforced by Storage.
CREATE POLICY "jd_anon_upload"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'job_descriptions');

-- NOTE: We do NOT add any SELECT policy here.
-- Result: uploads succeed, but anon cannot read/list/download files.
-- You (admin) can access files via the Supabase dashboard or service role.
