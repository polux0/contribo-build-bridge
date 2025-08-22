-- Check where email addresses are stored after Gmail signup
-- Run this after signing up with Gmail to see the data

-- 1. Check auth.users table (Supabase's built-in auth)
SELECT 
    'auth.users' as table_name,
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 2. Check public.profiles table (your custom table)
SELECT 
    'public.profiles' as table_name,
    id,
    user_id,
    email,
    name,
    created_at
FROM public.profiles 
WHERE email IS NOT NULL
ORDER BY created_at DESC
LIMIT 5;

-- 3. Join both tables to see the relationship
SELECT 
    u.id as auth_user_id,
    u.email as auth_email,
    p.user_id as profile_user_id,
    p.email as profile_email,
    p.name as profile_name,
    u.created_at as auth_created,
    p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
WHERE u.email IS NOT NULL
ORDER BY u.created_at DESC
LIMIT 5; 