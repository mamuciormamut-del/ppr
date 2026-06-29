/*
  # Add encrypted target data column to orders

  1. Changes
    - `orders` table: adds `encrypted_target_data` column (text, nullable)
      Stores encrypted OSINT audit target data for osint-category orders.
      The data is encrypted client-side before submission.

  2. Notes
    - Column is nullable because only OSINT orders will populate it.
    - No security changes needed — existing RLS policies cover this column.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'encrypted_target_data'
  ) THEN
    ALTER TABLE orders ADD COLUMN encrypted_target_data text;
  END IF;
END $$;
