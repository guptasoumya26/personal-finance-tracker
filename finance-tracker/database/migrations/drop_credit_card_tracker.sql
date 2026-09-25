-- Migration: Retire the credit card bill tracker
-- Description: The credit card bill tracker UI was removed from the app. This drops the
--              table backing it (and its rows) from your Supabase project.
--
-- Run this in the Supabase SQL Editor. It is IRREVERSIBLE once executed.

-- Drop the credit card tracker table and all of its rows
DROP TABLE IF EXISTS credit_card_entries CASCADE;

-- The tracker's editable title was stored on the per-user notes row. The application
-- no longer reads or writes it, so it goes with the rest of the credit card data.
ALTER TABLE notes DROP COLUMN IF EXISTS credit_card_tracker_title;
