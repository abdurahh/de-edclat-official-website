create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop policy if exists "Public can read active products" on public.products;

create policy "Anyone can read active products"
  on public.products
  for select
  to anon, authenticated
  using (is_active = true);

create policy "Admins can read all products"
  on public.products
  for select
  to authenticated
  using (public.is_admin());

revoke all on function public.is_admin() from public;
revoke all on function public.is_admin() from anon;
grant execute on function public.is_admin() to authenticated;
