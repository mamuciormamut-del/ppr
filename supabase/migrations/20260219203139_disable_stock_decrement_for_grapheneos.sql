/*
  # Disable automatic stock decrement for GrapheneOS products
  
  1. Modified Trigger
    - Update decrement_product_stock() function to skip GrapheneOS products
    - Stock for Duch Basic and Twierdza PRO will be manually managed
    
  2. Notes
    - Other products (SIM, etc.) with stock will still auto-decrement
    - GrapheneOS stock will only change via manual admin intervention
*/

CREATE OR REPLACE FUNCTION decrement_product_stock()
RETURNS trigger AS $$
BEGIN
  UPDATE products
  SET stock = stock - 1
  WHERE id = NEW.product_id
    AND stock IS NOT NULL
    AND stock > 0
    AND category != 'grapheneos';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
