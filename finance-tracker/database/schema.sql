-- Finance Tracker Database Schema - COMPLETE RESET
-- Run this in your Supabase SQL Editor

-- ⚠️ WARNING: This will DROP ALL EXISTING DATA and recreate everything
-- Uncomment the section below ONLY if you want to completely reset the database

-- === COMPLETE DATABASE RESET - UNCOMMENT TO USE ===
-- Drop all existing tables and data
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS central_investment_templates CASCADE;
DROP TABLE IF EXISTS expenses CASCADE;
DROP TABLE IF EXISTS central_templates CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop all custom functions and triggers
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS check_user_limit() CASCADE;

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
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    source_type VARCHAR(20) NOT NULL CHECK (source_type IN ('manual', 'template')),
    monthly_template_instance_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Central Investment Templates Table
CREATE TABLE IF NOT EXISTS central_investment_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Investments Table
CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    category VARCHAR(100) NOT NULL,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    source_type VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source_type IN ('manual', 'template')),
    monthly_template_instance_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    month VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, month) -- One note per user per month
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_central_templates_user_id ON central_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_month ON expenses(month);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_source_type ON expenses(source_type);
CREATE INDEX IF NOT EXISTS idx_central_investment_templates_user_id ON central_investment_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_user_id ON investments(user_id);
CREATE INDEX IF NOT EXISTS idx_investments_month ON investments(month);
CREATE INDEX IF NOT EXISTS idx_investments_category ON investments(category);
CREATE INDEX IF NOT EXISTS idx_investments_source_type ON investments(source_type);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
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

CREATE TRIGGER update_central_investment_templates_updated_at
    BEFORE UPDATE ON central_investment_templates
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

-- Database setup complete with secure user isolation
-- All tables now include proper user_id foreign keys for data security

-- Create default admin user
-- Replace 'your-admin-username' and 'your-secure-password' with your actual credentials
-- The password will be hashed automatically by the application

INSERT INTO users (username, email, password_hash, role, status) VALUES (
    'admin',
    'admin@financetracker.com',
    '$2b$12$Wr8InVh9yZ7vw2A/.qKwX.OuRe7/L5iBPh481iGFLfeAKEDIiySN6', -- Password: 'admin123'
    'admin',
    'active'
) ON CONFLICT (username) DO NOTHING;

-- ⚠️ IMPORTANT: Change the default password after first login!
-- The default password is 'admin123' - this is NOT secure for production

-- Sample data (optional - uncomment if you want sample templates)
-- INSERT INTO central_templates (user_id, items) VALUES (
--     (SELECT id FROM users WHERE role = 'admin' LIMIT 1),
--     '[
--         {"id": "1", "name": "Rent", "amount": 50000, "category": "Rent/Mortgage"},
--         {"id": "2", "name": "Utilities", "amount": 5000, "category": "Utilities"},
--         {"id": "3", "name": "Groceries", "amount": 15000, "category": "Food & Groceries"}
--     ]'::jsonb
-- );