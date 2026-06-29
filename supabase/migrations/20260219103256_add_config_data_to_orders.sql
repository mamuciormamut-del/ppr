/*
  # Add config_data JSON column to orders

  1. Changes
    - `orders` table: adds `config_data` column (jsonb, nullable)
      Stores product-specific configuration data such as VPN preferences
      or VoIP preferences selected by the customer during checkout.

  2. Notes
    - Column is nullable because only VPN/VoIP orders will populate it.
    - Existing RLS policies cover this column automatically.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'config_data'
  ) THEN
    ALTER TABLE orders ADD COLUMN config_data jsonb;
  END IF;
END $$;
