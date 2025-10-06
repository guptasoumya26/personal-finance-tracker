-- COMBINED MIGRATION: Income and External Investment Buffer
-- Date: 2025-10-06
-- Description: Adds both income and external_investment_buffer tables
-- RUN THIS IN YOUR PRODUCTION SUPABASE SQL EDITOR

-- ============================================
-- PART 1: Create Income Table
-- ============================================

CREATE TABLE IF NOT EXISTS income (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    source VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for income
CREATE INDEX IF NOT EXISTS idx_income_user_id ON income(user_id);
CREATE INDEX IF NOT EXISTS idx_income_month ON income(month);

-- ============================================
-- PART 2: Create External Investment Buffer Table
-- ============================================

CREATE TABLE IF NOT EXISTS external_investment_buffer (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for external_investment_buffer
CREATE INDEX IF NOT EXISTS idx_external_investment_buffer_user_id ON external_investment_buffer(user_id);
CREATE INDEX IF NOT EXISTS idx_external_investment_buffer_month ON external_investment_buffer(month);

-- ============================================
-- Migration Complete!
-- ============================================

-- Rollback instructions (if needed):
-- DROP INDEX IF EXISTS idx_external_investment_buffer_month;
-- DROP INDEX IF EXISTS idx_external_investment_buffer_user_id;
-- DROP TABLE IF EXISTS external_investment_buffer;
-- DROP INDEX IF EXISTS idx_income_month;
-- DROP INDEX IF EXISTS idx_income_user_id;
-- DROP TABLE IF EXISTS income;
