-- Migration: Add external_investment_buffer table
-- Date: 2025-10-06
-- Description: Adds external investment buffer tracking table

-- Create external_investment_buffer table
CREATE TABLE IF NOT EXISTS external_investment_buffer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_external_investment_buffer_user_id ON external_investment_buffer(user_id);
CREATE INDEX IF NOT EXISTS idx_external_investment_buffer_month ON external_investment_buffer(month);

-- Rollback instructions (if needed):
-- DROP INDEX IF EXISTS idx_external_investment_buffer_month;
-- DROP INDEX IF EXISTS idx_external_investment_buffer_user_id;
-- DROP TABLE IF EXISTS external_investment_buffer;
