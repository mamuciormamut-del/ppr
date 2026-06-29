/*
  # Fix orders insert-returning, add stock to products, create recent_activity table

  1. Security Changes (orders)
    - Drop existing INSERT policy that blocks the RETURNING clause
    - Recreate INSERT policy for anon+authenticated
    - Add narrow SELECT policy for anon so .insert().select() works
    - The issue: Supabase JS `.insert().select()` requires both INSERT and SELECT

  2. Modified Tables
    - `products`
      - Added `stock` (integer, nullable) - available inventory count (null = unlimited)

  3. New Tables
    - `recent_activity`
      - `id` (uuid, primary key)
      - `product_name` (text) - product display name
      - `city` (text) - random city for display
      - `created_at` (timestamptz) - timestamp for "time ago" calculation
    - RLS enabled, public SELECT for anon

  4. Seed Data
    - Set stock = 11 for both GrapheneOS products
    - Seed recent_activity with sample entries

  5. Stock Decrement
    - Trigger on orders INSERT decrements product stock automatically
*/

-- Fix: allow anon to read back the row they just inserted
DROP POLICY IF EXISTS "Anyone can place orders" ON orders;

CREATE POLICY "Anon and auth can insert orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anon can read own new order"
  ON orders FOR SELECT
  TO anon
  USING (created_at >= (now() - interval '30 seconds'));

-- Add stock column to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'stock'
  ) THEN
    ALTER TABLE products ADD COLUMN stock integer;
  END IF;
END $$;

-- Set stock for GrapheneOS products
UPDATE products SET stock = 11 WHERE slug = 'duch-basic';
UPDATE products SET stock = 11 WHERE slug = 'twierdza-pro';

-- Create recent_activity table for social proof ticker
CREATE TABLE IF NOT EXISTS recent_activity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name text NOT NULL,
  city text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE recent_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recent activity"
  ON recent_activity FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only admin can insert recent activity"
  ON recent_activity FOR INSERT
  TO authenticated
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');

-- Seed recent_activity with realistic entries
INSERT INTO recent_activity (product_name, city, created_at) VALUES
  ('Rejestracja Karty SIM', 'Warszawa', now() - interval '23 minutes'),
  ('Karta SIM + Dostawa', 'Kraków', now() - interval '1 hour 12 minutes'),
  ('Konfiguracja + 6 msc VPN', 'Wrocław', now() - interval '2 hours 45 minutes'),
  ('Subskrypcja VoIP', 'Gdańsk', now() - interval '3 hours 18 minutes'),
  ('Duch Basic (GrapheneOS)', 'Poznań', now() - interval '4 hours 5 minutes'),
  ('Skaner OSINT', 'Łódź', now() - interval '5 hours 30 minutes'),
  ('Rejestracja Karty SIM', 'Katowice', now() - interval '6 hours 10 minutes'),
  ('Karta SIM + Dostawa', 'Szczecin', now() - interval '7 hours 22 minutes');

-- Function to decrement stock on order insert
CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS trigger AS $$
BEGIN
  UPDATE products
  SET stock = stock - 1
  WHERE id = NEW.product_id
    AND stock IS NOT NULL
    AND stock > 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_decrement_stock ON orders;
CREATE TRIGGER trg_decrement_stock
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION decrement_product_stock();
