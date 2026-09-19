-- Gemstone colors + product FKs + serial assignment for diamond / gemstone

create table public.gemstone_colors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  serial_prefix text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint gemstone_colors_name_not_blank check (char_length(trim(name)) > 0)
);

create unique index gemstone_colors_name_unique_idx
  on public.gemstone_colors (lower(trim(name)));

create trigger gemstone_colors_set_updated_at
before update on public.gemstone_colors
for each row
execute function public.set_updated_at();

-- Prefix = first two letters of color; extend if taken. W and D reserved.
create or replace function public.assign_gemstone_color_serial_prefix()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean text;
  v_len integer;
  v_candidate text;
  v_taken text[];
begin
  if new.serial_prefix is not null and length(trim(new.serial_prefix)) > 0 then
    new.serial_prefix := upper(regexp_replace(trim(new.serial_prefix), '[^A-Za-z]', '', 'g'));
    if char_length(new.serial_prefix) < 2 then
      raise exception 'Gemstone color serial prefix must be at least 2 letters';
    end if;
    return new;
  end if;

  v_clean := regexp_replace(new.name, '[^A-Za-z]', '', 'g');
  if char_length(v_clean) < 2 then
    raise exception 'Gemstone color name must contain at least 2 letters for a serial prefix';
  end if;

  select coalesce(array_agg(upper(serial_prefix)), '{}')
    into v_taken
  from public.gemstone_colors
  where serial_prefix is not null
    and id is distinct from new.id;

  v_taken := v_taken || array['W', 'D'];

  -- Always start with first two letters of the color
  v_len := 2;
  v_candidate := upper(substr(v_clean, 1, v_len));
  while v_candidate = any (v_taken) and v_len < char_length(v_clean) loop
    v_len := v_len + 1;
    v_candidate := upper(substr(v_clean, 1, v_len));
  end loop;

  if v_candidate = any (v_taken) then
    raise exception 'Could not allocate unique serial prefix for color %', new.name;
  end if;

  new.serial_prefix := v_candidate;
  return new;
end;
$$;

create trigger gemstone_colors_assign_serial_prefix
before insert on public.gemstone_colors
for each row
execute function public.assign_gemstone_color_serial_prefix();

alter table public.gemstone_colors
  alter column serial_prefix set not null;

create unique index gemstone_colors_serial_prefix_unique_idx
  on public.gemstone_colors (upper(serial_prefix));

alter table public.gemstone_colors
  add constraint gemstone_colors_serial_prefix_format
  check (serial_prefix ~ '^[A-Z]{2,}$');

alter table public.gemstone_colors enable row level security;

create policy "Anyone can read gemstone colors"
  on public.gemstone_colors
  for select
  to anon, authenticated
  using (true);

create policy "Admins can insert gemstone colors"
  on public.gemstone_colors
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update gemstone colors"
  on public.gemstone_colors
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete gemstone colors"
  on public.gemstone_colors
  for delete
  to authenticated
  using (public.is_admin());

-- Product FK for gemstone color
alter table public.products
  add column if not exists gemstone_color_id uuid
    references public.gemstone_colors (id) on delete set null;

create index if not exists products_gemstone_color_id_idx
  on public.products (gemstone_color_id);

alter table public.products
  drop constraint if exists products_jewelry_type_category_check;

alter table public.products
  add constraint products_subtype_category_check
  check (
    (
      (category = 'jewelry' and gemstone_color_id is null)
      or (category = 'gemstone' and jewelry_type_id is null)
      or (category in ('watch', 'diamond') and jewelry_type_id is null and gemstone_color_id is null)
    )
  );

-- Reserve D (diamonds) alongside W on jewelry type prefixes
create or replace function public.assign_jewelry_type_serial_prefix()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_clean text;
  v_first text;
  v_same_count integer;
  v_len integer;
  v_candidate text;
  v_taken text[];
begin
  if new.serial_prefix is not null and length(trim(new.serial_prefix)) > 0 then
    new.serial_prefix := upper(regexp_replace(trim(new.serial_prefix), '[^A-Za-z]', '', 'g'));
    if new.serial_prefix = '' then
      raise exception 'Invalid serial_prefix';
    end if;
    return new;
  end if;

  v_clean := regexp_replace(new.name, '[^A-Za-z]', '', 'g');
  if v_clean = '' then
    raise exception 'Jewelry type name must contain letters to build a serial prefix';
  end if;

  v_first := upper(substr(v_clean, 1, 1));

  select count(*)::integer
    into v_same_count
  from public.jewelry_types
  where id is distinct from new.id
    and upper(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 1)) = v_first;

  v_len := least(1 + v_same_count, char_length(v_clean));
  if v_first in ('W', 'D') then
    v_len := greatest(v_len, least(2, char_length(v_clean)));
  end if;

  select coalesce(array_agg(upper(serial_prefix)), '{}')
    into v_taken
  from public.jewelry_types
  where serial_prefix is not null
    and id is distinct from new.id;

  v_taken := v_taken || array['W', 'D'];

  v_candidate := upper(substr(v_clean, 1, v_len));
  while v_candidate = any (v_taken) and v_len < char_length(v_clean) loop
    v_len := v_len + 1;
    v_candidate := upper(substr(v_clean, 1, v_len));
  end loop;

  if v_candidate = any (v_taken) then
    raise exception 'Could not allocate unique serial prefix for %', new.name;
  end if;

  new.serial_prefix := v_candidate;
  return new;
end;
$$;

-- Product serial: watch=W, diamond=D, jewelry=type prefix, gemstone=color prefix
create or replace function public.assign_product_serial_number()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
begin
  if tg_op = 'UPDATE' then
    if old.serial_number is not null then
      new.serial_number := old.serial_number;
      return new;
    end if;
  end if;

  if new.serial_number is not null and length(trim(new.serial_number)) > 0 then
    new.serial_number := upper(trim(new.serial_number));
    return new;
  end if;

  if new.category = 'watch' then
    v_prefix := 'W';
  elsif new.category = 'diamond' then
    v_prefix := 'D';
  elsif new.category = 'jewelry' then
    if new.jewelry_type_id is null then
      raise exception 'Jewelry products require a jewelry type before a serial can be assigned';
    end if;
    select serial_prefix into v_prefix
    from public.jewelry_types
    where id = new.jewelry_type_id;
    if v_prefix is null then
      raise exception 'Jewelry type not found for serial assignment';
    end if;
  elsif new.category = 'gemstone' then
    if new.gemstone_color_id is null then
      raise exception 'Gemstone products require a color before a serial can be assigned';
    end if;
    select serial_prefix into v_prefix
    from public.gemstone_colors
    where id = new.gemstone_color_id;
    if v_prefix is null then
      raise exception 'Gemstone color not found for serial assignment';
    end if;
  else
    raise exception 'Unsupported product category for serial assignment: %', new.category;
  end if;

  new.serial_number := public.allocate_product_serial_internal(v_prefix);
  return new;
end;
$$;
