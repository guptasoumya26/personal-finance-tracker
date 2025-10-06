-- Migration: Add display_order to expenses and investments tables
-- Date: 2025-10-06
-- Description: Adds display_order column for drag-and-drop reordering

-- Add display_order to expenses table
ALTER TABLE expenses
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Add display_order to investments table
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create indexes for better sorting performance
CREATE INDEX IF NOT EXISTS idx_expenses_display_order ON expenses(user_id, month, display_order);
CREATE INDEX IF NOT EXISTS idx_investments_display_order ON investments(user_id, month, display_order);

-- Rollback instructions (if needed):
-- DROP INDEX IF EXISTS idx_investments_display_order;
-- DROP INDEX IF EXISTS idx_expenses_display_order;
-- ALTER TABLE investments DROP COLUMN IF EXISTS display_order;
-- ALTER TABLE expenses DROP COLUMN IF EXISTS display_order;
