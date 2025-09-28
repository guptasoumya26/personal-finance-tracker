-- Finance Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Central Templates Table
CREATE TABLE IF NOT EXISTS central_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('manual', 'template')),
    monthly_template_instance_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content TEXT,
    month VARCHAR(7) NOT NULL UNIQUE, -- Format: YYYY-MM, one note per month
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_source_type ON expenses(source_type);
CREATE INDEX IF NOT EXISTS idx_investments_month ON investments(month);
CREATE INDEX IF NOT EXISTS idx_notes_month ON notes(month);

-- Update trigger for central_templates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_central_templates_updated_at
    BEFORE UPDATE ON central_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Enable if you plan to add authentication later
-- ALTER TABLE central_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Sample data (optional - remove if you don't want sample data)
-- INSERT INTO central_templates (items) VALUES (
--     '[
--         {"id": "1", "name": "Rent", "amount": 50000, "category": "Rent/Mortgage"},
--         {"id": "2", "name": "Utilities", "amount": 5000, "category": "Utilities"},
--         {"id": "3", "name": "Groceries", "amount": 15000, "category": "Food & Groceries"}
--     ]'::jsonb
-- );