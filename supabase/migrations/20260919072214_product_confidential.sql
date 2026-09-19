-- Company-only product fields. Never exposed via public product reads.
create table public.product_confidential (
  product_id uuid primary key references public.products (id) on delete cascade,
  cost numeric(12, 2) check (cost is null or cost >= 0),
  source_name text,
  source_link text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger product_confidential_set_updated_at
before update on public.product_confidential
for each row
execute function public.set_updated_at();

alter table public.product_confidential enable row level security;

create policy "Admins can read product confidential"
  on public.product_confidential
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can insert product confidential"
  on public.product_confidential
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update product confidential"
  on public.product_confidential
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete product confidential"
  on public.product_confidential
  for delete
  to authenticated
  using (public.is_admin());
