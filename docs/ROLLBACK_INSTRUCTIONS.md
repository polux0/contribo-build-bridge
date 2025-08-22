# 🔄 Rollback Instructions for Opportunities Table

## ⚠️ **WARNING: This will permanently delete the opportunities table and all its data!**

## 🛡️ **Before Running Rollback**

### Step 1: Check Impact (Recommended)
Run the safety check script to see what will be affected:

```bash
# Connect to your database and run the safety check
psql "your_database_connection_string" -f scripts/check-rollback-impact.sql
```

Or run it in Supabase Studio SQL Editor.

### Step 2: Backup Data (If Needed)
If you have important data in the opportunities table:

```bash
# Create a backup of the opportunities table
pg_dump --dbname="your_database_connection_string" \
        --table=public.opportunities \
        --data-only > opportunities_backup.sql
```

## 🚀 **Running the Rollback**

### For Local Development
```bash
# Apply the rollback migration locally
supabase db reset --no-seed
```

### For Production (⚠️ DANGEROUS!)
```bash
# Apply the rollback migration to production
supabase db push --linked
```

## 📋 **What the Rollback Does**

The rollback migration will:

1. **Drop the trigger** `update_opportunities_updated_at`
2. **Drop all indexes** on the opportunities table
3. **Drop the table** `public.opportunities` with CASCADE
4. **Remove all data** permanently
5. **Remove all constraints** and dependencies

## 🔍 **Verification After Rollback**

Check that the rollback was successful:

```sql
-- Check if table still exists (should return false)
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'opportunities'
);

-- Check if any remnants exist
SELECT * FROM information_schema.tables 
WHERE table_name LIKE '%opportunities%';
```

## 🚨 **Important Notes**

### **Data Loss**
- ✅ **All opportunities data will be permanently deleted**
- ✅ **No way to recover unless you have a backup**
- ✅ **All related records will be removed**

### **Dependencies**
- ✅ **Any foreign keys referencing opportunities will be dropped**
- ✅ **Indexes will be removed**
- ✅ **Triggers will be removed**

### **Function Safety**
- ⚠️ **The `update_updated_at_column` function is NOT dropped**
- ⚠️ **This function might be used by other tables**
- ⚠️ **Check manually if you need to drop it**

## 🔄 **If You Need to Recreate the Table**

If you rollback and later want to recreate the table:

```bash
# Apply the original migration again
supabase db push --linked
```

## 📞 **Emergency Contacts**

If something goes wrong:
1. Check your database backups
2. Contact your database administrator
3. Review the migration logs

## 🎯 **When to Use This Rollback**

- ❌ **Don't use** if you have important production data
- ❌ **Don't use** if other tables depend on opportunities
- ✅ **Use** if you're in development/testing
- ✅ **Use** if you need to completely start over
- ✅ **Use** if you have a backup and need to revert

## 🛡️ **Best Practice**

**Always test rollbacks in a development environment first!** 