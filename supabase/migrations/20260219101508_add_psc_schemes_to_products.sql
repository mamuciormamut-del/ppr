/*
  # Add PSC Schemes to Products

  1. Changes
    - `products` table: adds `psc_schemes` column (jsonb array of arrays)
      Each element is an array of integers representing a combination of PSC card amounts
      that sum to the product price. Up to 3 schemes per product.
      Example for 130 PLN: [[50,50,30],[100,30],[130]]

  2. Notes
    - Products with price > 1000 PLN are BTC-only, so psc_schemes will be empty for those.
    - Existing psc_amounts column is kept for backwards compatibility.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'psc_schemes'
  ) THEN
    ALTER TABLE products ADD COLUMN psc_schemes jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

UPDATE products SET psc_schemes = '[[50,50,30],[100,30],[130]]'::jsonb
  WHERE name = 'Skaner';

UPDATE products SET psc_schemes = '[[100,100,100,40],[200,100,40],[200,140]]'::jsonb
  WHERE name = 'Duch w Sieci';

UPDATE products SET psc_schemes = '[[10,10,10,10],[20,20],[40]]'::jsonb
  WHERE name = 'Subskrypcja Miesięczna';

UPDATE products SET psc_schemes = '[[100,100],[50,50,50,50],[200]]'::jsonb
  WHERE name = 'Konfiguracja + 6 msc';

UPDATE products SET psc_schemes = '[[10,10,10],[10,20],[30]]'::jsonb
  WHERE name = 'Rejestracja Karty SIM';

UPDATE products SET psc_schemes = '[[10,10,10,10,10],[20,20,10],[50]]'::jsonb
  WHERE name = 'Karta SIM + Dostawa';
