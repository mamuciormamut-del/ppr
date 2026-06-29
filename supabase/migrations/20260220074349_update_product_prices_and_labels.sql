/*
  # Update product prices and add bestseller label
  
  1. Modified Prices
    - Duch Basic: 1300 zł (was 2100 zł)
    - Twierdza PRO: 2500 zł (was 3200 zł)
    - Rejestracja karty SIM: 50 zł (was 70 zł)
    - Karta SIM + Dostawa: 70 zł (was 90 zł)
  
  2. Modified Tables
    - `products`: Updated price_pln and old_price_pln columns
    - Added discount_percent calculation for discounted items
    
  3. Notes
    - BESTSELLER label shown for "Rejestracja karty SIM" with yellow accent
*/

UPDATE products SET 
  price_pln = 1300,
  old_price_pln = 2100,
  discount_percent = 38
WHERE slug = 'duch-basic';

UPDATE products SET 
  price_pln = 2500,
  old_price_pln = 3200,
  discount_percent = 22
WHERE slug = 'twierdza-pro';

UPDATE products SET 
  price_pln = 50,
  old_price_pln = 70,
  discount_percent = 29
WHERE slug = 'rejestracja-karty-sim';

UPDATE products SET 
  price_pln = 70,
  old_price_pln = 90,
  discount_percent = 22
WHERE slug = 'karta-sim-dostawa';
