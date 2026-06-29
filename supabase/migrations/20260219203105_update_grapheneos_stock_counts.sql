/*
  # Update GrapheneOS stock counts
  
  1. Modified Tables
    - `products`
      - Duch Basic (GrapheneOS): stock = 11
      - Twierdza PRO (GrapheneOS): stock = 57
      
  2. Notes
    - Stock for these products will now be manually managed
    - No auto-decrement on order placement for GrapheneOS
*/

UPDATE products SET stock = 11 WHERE slug = 'duch-basic';
UPDATE products SET stock = 57 WHERE slug = 'twierdza-pro';
