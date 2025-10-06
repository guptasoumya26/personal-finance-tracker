-- Migration: Add credit_card_tracker_title to notes table
-- Date: 2025-10-06
-- Description: Adds credit card tracker title field to store per-month custom titles

-- Add credit_card_tracker_title column to notes table
ALTER TABLE notes
ADD COLUMN IF NOT EXISTS credit_card_tracker_title VARCHAR(255) DEFAULT 'Credit Card Bill Tracker';

-- Rollback instructions (if needed):
-- ALTER TABLE notes DROP COLUMN IF EXISTS credit_card_tracker_title;
