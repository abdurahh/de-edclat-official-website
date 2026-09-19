-- Jewelry subtypes (Ring, Necklace, …) for catalog + future serial numbers
create table public.jewelry_types (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jewelry_types_name_not_blank check (char_length(trim(name)) > 0)
);

-- Case-insensitive uniqueness so "Ring" and "ring" cannot both exist
create unique index jewelry_types_name_unique_idx
  on public.jewelry_types (lower(trim(name)));

create trigger jewelry_types_set_updated_at
before update on public.jewelry_types
for each row
execute function public.set_updated_at();

alter table public.products
  add column jewelry_type_id uuid references public.jewelry_types (id) on delete set null;

create index products_jewelry_type_id_idx
  on public.products (jewelry_type_id);

-- Watches must not carry a jewelry type; jewelry rows may leave it null until set
alter table public.products
  add constraint products_jewelry_type_category_check
  check (
    (category = 'jewelry')
    or (jewelry_type_id is null)
  );

alter table public.jewelry_types enable row level security;

create policy "Anyone can read jewelry types"
  on public.jewelry_types
  for select
  to anon, authenticated
  using (true);

create policy "Admins can insert jewelry types"
  on public.jewelry_types
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update jewelry types"
  on public.jewelry_types
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete jewelry types"
  on public.jewelry_types
  for delete
  to authenticated
  using (public.is_admin());
