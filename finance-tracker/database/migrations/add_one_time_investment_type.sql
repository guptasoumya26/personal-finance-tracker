-- Add 'One Time' to the investment_type CHECK constraint
-- Run this in Supabase SQL Editor

-- Drop the existing constraint
ALTER TABLE investments DROP CONSTRAINT IF EXISTS investments_investment_type_check;

-- Add updated constraint with 'One Time'
ALTER TABLE investments ADD CONSTRAINT investments_investment_type_check
  CHECK (investment_type IN ('Self', 'Combined', 'One Time', 'Other'));
