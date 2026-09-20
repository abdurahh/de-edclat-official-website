-- Close public RPC surface on SECURITY DEFINER serial helpers.
-- Triggers still run as the function owner and do not need client EXECUTE.
-- Admin UI keeps preview_next_product_serial / next_product_serial for authenticated.

revoke all on function public.allocate_product_serial_internal(text, integer)
  from public, anon, authenticated;

revoke all on function public.next_product_serial(text, integer)
  from public, anon;
grant execute on function public.next_product_serial(text, integer)
  to authenticated;

revoke all on function public.preview_next_product_serial(text, integer)
  from public, anon;
grant execute on function public.preview_next_product_serial(text, integer)
  to authenticated;

revoke all on function public.assign_product_serial_number()
  from public, anon, authenticated;

revoke all on function public.assign_jewelry_type_serial_prefix()
  from public, anon, authenticated;

revoke all on function public.assign_gemstone_color_serial_prefix()
  from public, anon, authenticated;
