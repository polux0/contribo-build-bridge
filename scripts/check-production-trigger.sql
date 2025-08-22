-- Safe script to check if trigger exists in production
-- This is READ-ONLY and won't make any changes

-- Check if the trigger exists
SELECT 
    'Trigger exists' as status,
    triggername,
    tablename,
    schemaname
FROM pg_trigger 
WHERE triggername = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    'Function exists' as status,
    proname as function_name,
    prosrc as function_source
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- Check recent profile creations (last 10)
SELECT 
    'Recent profiles' as status,
    id,
    user_id,
    email,
    name,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10; 