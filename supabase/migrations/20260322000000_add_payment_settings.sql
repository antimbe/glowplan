-- Add payment and deposit configuration fields to establishments table
ALTER TABLE establishments
ADD COLUMN IF NOT EXISTS require_deposit BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS deposit_amount TEXT,
ADD COLUMN IF NOT EXISTS payment_links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS payment_instructions TEXT;
