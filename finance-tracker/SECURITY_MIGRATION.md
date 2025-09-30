# 🚨 CRITICAL SECURITY MIGRATION GUIDE

## ⚠️ URGENT: User Data Isolation Security Fix

**This migration addresses a critical security vulnerability where all users were sharing the same financial data.**

### What Was Wrong
- All users could see each other's expenses, investments, templates, and notes
- No user isolation in database queries
- Serious privacy and security breach

### What's Fixed
- Added `user_id` foreign keys to all data tables
- Updated all API routes to filter by authenticated user
- Proper data isolation implemented

---

## 🔧 Migration Steps

### 1. Database Schema Update

Run the updated schema in your Supabase SQL Editor:

```sql
-- The schema has been updated in database/schema.sql
-- For NEW installations, just run the updated schema
```

### 2. For EXISTING Installations with Data

**⚠️ WARNING: This will assign all existing data to the first admin user**

Uncomment and run this migration in Supabase SQL Editor:

```sql
DO $$
DECLARE
    first_admin_id UUID;
BEGIN
    -- Get the first admin user
    SELECT id INTO first_admin_id FROM users WHERE role = 'admin' ORDER BY created_at LIMIT 1;

    IF first_admin_id IS NOT NULL THEN
        -- Add user_id column to existing tables if they don't have it
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'central_templates' AND column_name = 'user_id') THEN
            ALTER TABLE central_templates ADD COLUMN user_id UUID;
            UPDATE central_templates SET user_id = first_admin_id WHERE user_id IS NULL;
            ALTER TABLE central_templates ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE central_templates ADD CONSTRAINT fk_central_templates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'expenses' AND column_name = 'user_id') THEN
            ALTER TABLE expenses ADD COLUMN user_id UUID;
            UPDATE expenses SET user_id = first_admin_id WHERE user_id IS NULL;
            ALTER TABLE expenses ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE expenses ADD CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'investments' AND column_name = 'user_id') THEN
            ALTER TABLE investments ADD COLUMN user_id UUID;
            UPDATE investments SET user_id = first_admin_id WHERE user_id IS NULL;
            ALTER TABLE investments ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE investments ADD CONSTRAINT fk_investments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'central_investment_templates' AND column_name = 'user_id') THEN
            ALTER TABLE central_investment_templates ADD COLUMN user_id UUID;
            UPDATE central_investment_templates SET user_id = first_admin_id WHERE user_id IS NULL;
            ALTER TABLE central_investment_templates ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE central_investment_templates ADD CONSTRAINT fk_central_investment_templates_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'notes' AND column_name = 'user_id') THEN
            ALTER TABLE notes ADD COLUMN user_id UUID;
            UPDATE notes SET user_id = first_admin_id WHERE user_id IS NULL;
            ALTER TABLE notes ALTER COLUMN user_id SET NOT NULL;
            ALTER TABLE notes ADD CONSTRAINT fk_notes_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
            -- Update the unique constraint
            ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_month_key;
            ALTER TABLE notes ADD CONSTRAINT unique_user_month UNIQUE (user_id, month);
        END IF;
    END IF;
END $$;
```

### 3. Add New Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_central_templates_user_id ON central_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_central_investment_templates_user_id ON central_investment_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
```

### 4. Deploy Updated Code

The following files have been updated with proper user isolation:

- `src/lib/auth-utils.ts` (NEW - Authentication utilities)
- `src/app/api/central-template/route.ts`
- `src/app/api/central-investment-template/route.ts`
- `src/app/api/expenses/route.ts`
- `src/app/api/investments/route.ts`
- `src/app/api/notes/route.ts`
- `database/schema.sql`

Deploy these changes to your production environment.

---

## 🧪 Testing User Isolation

### After Migration:

1. **Create Test Users:**
   - Create 2-3 test user accounts
   - Login with different users

2. **Test Data Isolation:**
   - Add expenses/investments with User A
   - Login as User B
   - Verify User B cannot see User A's data
   - Verify User B can create their own data

3. **Test Templates:**
   - Create expense/investment templates with User A
   - Login as User B
   - Verify User B cannot see User A's templates
   - Verify each user has independent templates

### Verification Queries

Run these in Supabase to verify isolation:

```sql
-- Check that all data has user_id
SELECT COUNT(*) FROM expenses WHERE user_id IS NULL; -- Should be 0
SELECT COUNT(*) FROM investments WHERE user_id IS NULL; -- Should be 0
SELECT COUNT(*) FROM central_templates WHERE user_id IS NULL; -- Should be 0
SELECT COUNT(*) FROM notes WHERE user_id IS NULL; -- Should be 0

-- Check data distribution by user
SELECT user_id, COUNT(*) as expense_count FROM expenses GROUP BY user_id;
SELECT user_id, COUNT(*) as investment_count FROM investments GROUP BY user_id;
```

---

## 🔍 What Changed

### Database Schema Changes:
- ✅ Added `user_id UUID NOT NULL` to all data tables
- ✅ Added foreign key constraints with `ON DELETE CASCADE`
- ✅ Updated unique constraints for notes (per user per month)
- ✅ Added performance indexes for user_id columns

### API Security Changes:
- ✅ All routes now require authentication
- ✅ All queries filtered by current user's ID
- ✅ Double-checked user ownership in updates/deletes
- ✅ Proper error handling for authentication failures

### New Features:
- ✅ Complete investment template system
- ✅ Fixed phantom chart data with date validation
- ✅ Added investment categories and source type tracking

---

## ⚠️ Important Notes

1. **Existing Data:** All existing data will be assigned to the first admin user
2. **User Limit:** Maximum 5 users enforced by database trigger
3. **Data Loss Prevention:** Foreign keys use `CASCADE DELETE` to maintain referential integrity
4. **Backward Compatibility:** Legacy authentication tokens still supported during transition

---

## 🚀 Post-Migration

After successful migration:

1. Test the application thoroughly with multiple users
2. Verify each user sees only their own data
3. Test the new investment template functionality
4. Confirm charts show correct data without phantom entries
5. Monitor logs for any authentication errors

**The security vulnerability has been completely resolved. Each user now has fully isolated financial data.**