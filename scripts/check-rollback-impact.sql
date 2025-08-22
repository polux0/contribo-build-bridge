-- Safety Check Script: Check Impact of Opportunities Table Rollback
-- Run this BEFORE applying the rollback migration to see what will be affected

-- Check if opportunities table exists and has data
SELECT 
    'opportunities_table_exists' as check_type,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'opportunities'
    ) as result;

-- Count records in opportunities table (if it exists)
SELECT 
    'opportunities_record_count' as check_type,
    COUNT(*) as result
FROM public.opportunities;

-- Check for any foreign key constraints that reference opportunities table
SELECT 
    'foreign_keys_to_opportunities' as check_type,
    COUNT(*) as result
FROM information_schema.table_constraints tc
JOIN information_schema.constraint_column_usage ccu ON tc.constraint_name = ccu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'opportunities';

-- List any foreign key constraints that reference opportunities table
SELECT 
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND ccu.table_name = 'opportunities';

-- Check if update_updated_at_column function is used by other tables
SELECT 
    'function_usage_count' as check_type,
    COUNT(*) as result
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%' 
AND event_object_table != 'opportunities';

-- List all triggers that use the update_updated_at_column function
SELECT 
    trigger_name,
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE trigger_name LIKE '%updated_at%'; 