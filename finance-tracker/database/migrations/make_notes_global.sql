-- Migration: Make notes global (not per-month)
-- Date: 2025-10-25
-- Description: Removes month column and unique constraint, makes notes persist across all months

-- Step 1: Drop the existing unique constraint on (user_id, month)
ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_month_key;

-- Step 2: For existing data, keep only the most recent note per user
-- This prevents duplicate user_id when we add the new unique constraint
DELETE FROM notes a
WHERE a.created_at < (
    SELECT MAX(b.created_at)
    FROM notes b
    WHERE b.user_id = a.user_id
);

-- Step 3: Drop the month column (no longer needed for global notes)
ALTER TABLE notes DROP COLUMN IF EXISTS month;

-- Step 4: Drop the month index (no longer needed)
DROP INDEX IF EXISTS idx_notes_month;

-- Step 5: Add unique constraint on user_id (one global note per user)
ALTER TABLE notes ADD CONSTRAINT notes_user_id_key UNIQUE(user_id);

-- Migration complete!
-- Notes are now global per user, not per-month

-- Rollback instructions (if needed):
-- WARNING: This will lose data if you've been using global notes
-- ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_user_id_key;
-- ALTER TABLE notes ADD COLUMN month VARCHAR(7);
-- CREATE INDEX idx_notes_month ON notes(month);
-- ALTER TABLE notes ADD CONSTRAINT notes_user_id_month_key UNIQUE(user_id, month);
