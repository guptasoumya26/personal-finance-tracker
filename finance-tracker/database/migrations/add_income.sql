-- Migration: Add income table
-- Date: 2025-10-06
-- Description: Adds income tracking table for monthly income entries

-- Create income table
CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_month ON income(month);

-- Rollback instructions (if needed):
-- DROP INDEX IF EXISTS idx_income_month;
-- DROP INDEX IF EXISTS idx_income_user_id;
-- DROP TABLE IF EXISTS income;
