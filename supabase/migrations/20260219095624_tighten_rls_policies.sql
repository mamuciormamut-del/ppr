/*
  # Tighten RLS policies for orders table

  1. Security Changes
    - Replaced broad "authenticated" SELECT/UPDATE policies with admin-only policies
    - Admin is identified by email 'admin@prywaciarz.com' via auth.jwt()
    - Anonymous users can still INSERT orders but cannot read/update/delete them
    - No DELETE policy exists, so no one can delete orders

  2. Notes
    - Uses auth.jwt() -> 'email' to verify admin identity
    - This is more secure than just checking auth.uid() IS NOT NULL
    - Prevents any other authenticated user from accessing orders
*/

DROP POLICY IF EXISTS "Authenticated users can view orders" ON orders;
DROP POLICY IF EXISTS "Authenticated users can update orders" ON orders;

CREATE POLICY "Admin can view orders"
  ON orders FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');

CREATE POLICY "Admin can update orders"
  ON orders FOR UPDATE
  TO authenticated
  USING ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'admin@prywaciarz.com');
