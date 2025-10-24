-- Migration: Add is_completed column to expenses and investments tables
-- Date: 2025-10-25
-- Description: Adds is_completed boolean field to track completion status per month

-- Add is_completed to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Add is_completed to investments table
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Create indexes for better query performance on is_completed
CREATE INDEX IF NOT EXISTS idx_expenses_is_completed ON expenses(user_id, month, is_completed);
CREATE INDEX IF NOT EXISTS idx_investments_is_completed ON investments(user_id, month, is_completed);

-- Rollback instructions (if needed):
-- DROP INDEX IF EXISTS idx_investments_is_completed;
-- DROP INDEX IF EXISTS idx_expenses_is_completed;
-- ALTER TABLE investments DROP COLUMN IF EXISTS is_completed;
-- ALTER TABLE expenses DROP COLUMN IF EXISTS is_completed;
