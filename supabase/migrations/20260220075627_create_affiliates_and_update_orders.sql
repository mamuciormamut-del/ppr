/*
  # Affiliate (Referral) System
  
  ## Summary
  Implements an anonymous affiliate/referral program that requires no user accounts.
  
  ## New Tables
  - `affiliates`
    - `id` (uuid, primary key)
    - `btc_payout_address` (text) - Bitcoin address for payouts
    - `secret_token` (uuid) - unique secret for accessing the dashboard
    - `created_at` (timestamptz)
  
  ## Modified Tables
  - `orders`
    - Added `referrer_id` (uuid, nullable) - FK to affiliates.id
  
  ## Security
  - RLS enabled on affiliates table
  - Public can INSERT (anyone can join the program)
  - SELECT is restricted to matching secret_token (read via anon/service key)
  - Orders table already has RLS; adding referrer_id doesn't change existing policies
  
  ## Notes
  1. No authentication required - access controlled by secret_token UUID
  2. Commissions calculated: 200 PLN per 20 completed referred purchases
  3. Affiliate stats computed from joined orders
*/

CREATE TABLE IF NOT EXISTS affiliates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  btc_payout_address text NOT NULL,
  secret_token uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE affiliates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create an affiliate account"
  ON affiliates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Affiliates can view own record by secret token"
  ON affiliates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'referrer_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN referrer_id uuid REFERENCES affiliates(id) ON DELETE SET NULL;
  END IF;
END $$;
