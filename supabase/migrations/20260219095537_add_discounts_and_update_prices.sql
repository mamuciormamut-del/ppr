/*
  # Add discount support and update product prices

  1. Modified Tables
    - `products`
      - Added `old_price_pln` (integer, nullable) - original price before discount
      - Added `discount_percent` (integer, nullable) - discount percentage to display
      - Updated prices and PSC amounts for discounted products

  2. Price Changes
    - Rejestracja Karty SIM: 50 -> 30 PLN (~40% off, shown as ~30%)
    - Karta SIM + Dostawa: 70 -> 50 PLN (~29% off, shown as ~30%)
    - Duch Basic: 2500 -> 2000 PLN (20% off)
    - Twierdza PRO: 4000 -> 3200 PLN (20% off)
    - Skaner: 150 -> 130 PLN (~13%, shown as 15%)
    - Duch w Sieci: 400 -> 340 PLN (15% off)
    - Subskrypcja VoIP: 50 -> 40 PLN (20% off)
    - VPN Setup: 300 -> 200 PLN (~33% off)

  3. Notes
    - PSC amounts updated to match new prices
    - old_price_pln stores original price for display
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'old_price_pln'
  ) THEN
    ALTER TABLE products ADD COLUMN old_price_pln integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'discount_percent'
  ) THEN
    ALTER TABLE products ADD COLUMN discount_percent integer;
  END IF;
END $$;

UPDATE products SET old_price_pln = 50,  discount_percent = 30, price_pln = 30,   psc_amounts = '[30]'::jsonb        WHERE slug = 'sim-rejestracja';
UPDATE products SET old_price_pln = 70,  discount_percent = 30, price_pln = 50,   psc_amounts = '[50]'::jsonb        WHERE slug = 'sim-dostawa';
UPDATE products SET old_price_pln = 2500, discount_percent = 20, price_pln = 2000, psc_amounts = '[]'::jsonb          WHERE slug = 'duch-basic';
UPDATE products SET old_price_pln = 4000, discount_percent = 20, price_pln = 3200, psc_amounts = '[]'::jsonb          WHERE slug = 'twierdza-pro';
UPDATE products SET old_price_pln = 150,  discount_percent = 15, price_pln = 130,  psc_amounts = '[130]'::jsonb       WHERE slug = 'skaner';
UPDATE products SET old_price_pln = 400,  discount_percent = 15, price_pln = 340,  psc_amounts = '[170, 170]'::jsonb  WHERE slug = 'duch-w-sieci';
UPDATE products SET old_price_pln = 50,   discount_percent = 20, price_pln = 40,   psc_amounts = '[40]'::jsonb        WHERE slug = 'voip-sub';
UPDATE products SET old_price_pln = 300,  discount_percent = 33, price_pln = 200,  psc_amounts = '[100, 100]'::jsonb  WHERE slug = 'vpn-setup';
