-- Migration: Add credit_card_entries table
-- Date: 2025-10-06
-- Description: Adds credit card entries tracking for monthly bill calculation

-- Create credit_card_entries table
CREATE TABLE IF NOT EXISTS credit_card_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_credit_card_entries_user_id ON credit_card_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_card_entries_month ON credit_card_entries(month);

-- Rollback instructions (if needed):
-- DROP INDEX IF EXISTS idx_credit_card_entries_month;
-- DROP INDEX IF EXISTS idx_credit_card_entries_user_id;
-- DROP TABLE IF EXISTS credit_card_entries;
