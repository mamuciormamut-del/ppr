/*
  # Create products and orders tables for prywaciarz.com

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `slug` (text, unique) - URL-friendly identifier
      - `name` (text) - display name
      - `category` (text) - grouping: grapheneos, osint, voip, vpn, sim
      - `description` (text) - short product description
      - `price_pln` (integer) - price in PLN
      - `is_physical` (boolean) - requires shipping
      - `requires_phone_number` (boolean) - SIM registration needs phone input
      - `psc_amounts` (jsonb) - array of Paysafecard denominations required
      - `sort_order` (integer) - display ordering
      - `created_at` (timestamptz)
    - `orders`
      - `id` (uuid, primary key)
      - `order_number` (text, unique) - human-readable order ID
      - `product_id` (uuid, FK -> products)
      - `email` (text) - customer contact
      - `phone_number` (text, nullable) - SIM number to register
      - `paczkomat_code` (text, nullable) - InPost locker code
      - `payment_method` (text) - psc or btc
      - `psc_codes` (text[], nullable) - Paysafecard PINs
      - `status` (text) - pending or completed
      - `created_at` (timestamptz)

  2. Functions
    - `generate_order_number()` - generates unique order IDs like ORD-A3F8B1C2

  3. Security
    - RLS enabled on both tables
    - Products: public read access for anonymous users
    - Orders: anonymous can insert, only authenticated can select/update

  4. Seed Data
    - 8 products across 5 categories
*/

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  description text NOT NULL DEFAULT '',
  price_pln integer NOT NULL,
  is_physical boolean NOT NULL DEFAULT false,
  requires_phone_number boolean NOT NULL DEFAULT false,
  psc_amounts jsonb NOT NULL DEFAULT '[]'::jsonb,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Order number generator
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'ORD-' || upper(encode(gen_random_bytes(4), 'hex'));
END;
$$ LANGUAGE plpgsql;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL DEFAULT generate_order_number(),
  product_id uuid NOT NULL REFERENCES products(id),
  email text NOT NULL,
  phone_number text,
  paczkomat_code text,
  payment_method text NOT NULL CHECK (payment_method IN ('psc', 'btc')),
  psc_codes text[],
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Index for admin dashboard queries
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Seed products
INSERT INTO products (slug, name, category, description, price_pln, is_physical, requires_phone_number, psc_amounts, sort_order) VALUES
  ('duch-basic', 'Duch Basic', 'grapheneos', 'Google Pixel 8a + instalacja GrapheneOS + podstawowa konfiguracja anonimowych aplikacji.', 2500, true, false, '[]'::jsonb, 1),
  ('twierdza-pro', 'Twierdza PRO', 'grapheneos', 'Google Pixel 8 Pro + GrapheneOS + roczny opłacony prywatny VPN + routing przez sieć Tor.', 4000, true, false, '[]'::jsonb, 2),
  ('skaner', 'Skaner', 'osint', 'Sprawdzenie, jakie Twoje dane wyciekły do sieci (Darkweb, fora) i raport na e-mail.', 150, false, false, '[150]'::jsonb, 3),
  ('duch-w-sieci', 'Duch w Sieci', 'osint', 'Pełny audyt + instrukcje krok po kroku, jak usunąć swoje dane z popularnych baz i wyszukiwarek.', 400, false, false, '[200, 200]'::jsonb, 4),
  ('voip-sub', 'Subskrypcja Miesięczna', 'voip', 'Dostęp do zagranicznego numeru przez aplikację do odbierania SMS weryfikacyjnych (Telegram, Signal).', 50, false, false, '[50]'::jsonb, 5),
  ('vpn-setup', 'Konfiguracja + 6 msc', 'vpn', 'Konfiguracja dedykowanego serwera VPN na zagranicznym VPS, logi wyłączone, pełna kontrola.', 300, false, false, '[100, 100, 100]'::jsonb, 6),
  ('sim-rejestracja', 'Rejestracja Karty SIM', 'sim', 'Szybka, dyskretna zdalna rejestracja online telefonicznej karty SIM prepaid. Realizacja w 10 minut.', 50, false, true, '[50]'::jsonb, 7),
  ('sim-dostawa', 'Karta SIM + Dostawa', 'sim', 'Zarejestrowana polska karta SIM prepaid z dostawą przez InPost Paczkomat. Sieci: Orange, Plus, T-mobile, Play i inne.', 70, true, false, '[50, 20]'::jsonb, 8);
