/*
  # Enable realtime for orders table

  1. Changes
    - Add orders table to Supabase realtime publication
    - This allows the admin dashboard to receive live updates when new orders come in
*/

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
