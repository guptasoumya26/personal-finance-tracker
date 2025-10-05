-- Migration: Add investment_type column to investments table
-- Date: 2025-10-05
-- Description: Adds investment_type field to track Self/Combined/Other classifications

-- Step 1: Add the investment_type column with a default value
ALTER TABLE investments
ADD COLUMN IF NOT EXISTS investment_type VARCHAR(20) NOT NULL DEFAULT 'Self';

-- Step 2: Add CHECK constraint to ensure only valid values
ALTER TABLE investments
ADD CONSTRAINT investments_investment_type_check
CHECK (investment_type IN ('Self', 'Combined', 'Other'));

-- Step 3: Update central_investment_templates to support investment_type in JSONB
-- Note: Since items are stored as JSONB, the structure is flexible and doesn't need migration
-- New items will include investmentType, existing items will default to 'Self' in application logic

-- Step 4: Create index for better query performance on investment_type
CREATE INDEX IF NOT EXISTS idx_investments_investment_type ON investments(investment_type);

-- Rollback instructions (if needed):
-- ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_investment_type_check;
-- ALTER TABLE investments DROP COLUMN IF EXISTS investment_type;
-- DROP INDEX IF EXISTS idx_investments_investment_type;
