-- Finance Tracker Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE
);

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
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
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

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) - Enable for multi-user data isolation
-- Note: Run these after setting up your authentication system
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE central_templates ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Function to enforce user limit (max 5 users)
CREATE OR REPLACE FUNCTION check_user_limit()
RETURNS TRIGGER AS $$
BEGIN
    IF (SELECT COUNT(*) FROM users WHERE status = 'active') >= 5 THEN
        RAISE EXCEPTION 'Maximum user limit (5) reached. Cannot create more users.';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to enforce user limit on insert
CREATE TRIGGER enforce_user_limit
    BEFORE INSERT ON users
    FOR EACH ROW EXECUTE FUNCTION check_user_limit();

-- Sample data (optional - remove if you don't want sample data)
-- INSERT INTO central_templates (items) VALUES (
--     '[
--         {"id": "1", "name": "Rent", "amount": 50000, "category": "Rent/Mortgage"},
--         {"id": "2", "name": "Utilities", "amount": 5000, "category": "Utilities"},
--         {"id": "3", "name": "Groceries", "amount": 15000, "category": "Food & Groceries"}
--     ]'::jsonb
-- );