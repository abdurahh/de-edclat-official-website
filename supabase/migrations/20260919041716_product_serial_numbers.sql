-- Product serial numbers: PREFIX + YY + #### (e.g. R260001, W260001)
-- Deleted products free their serial; deactivated products keep occupying it.

alter table public.jewelry_types
  add column if not exists serial_prefix text;

alter table public.products
  add column if not exists serial_number text;

-- ---------------------------------------------------------------------------
-- Allocate next serial for a prefix + year, reusing gaps left by deletes.
-- Occupied = any remaining product row (active or deactivated).
-- ---------------------------------------------------------------------------
create or replace function public.next_product_serial(
  p_prefix text,
  p_year integer default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefix text;
  v_year integer;
  v_yy text;
  v_lock_key bigint;
  v_seq integer;
  v_used integer;
  v_serial text;
begin
  if not public.is_admin() then
    raise exception 'Not authorized to allocate serial numbers';
  end if;

  v_prefix := upper(trim(p_prefix));
  if v_prefix is null or v_prefix = '' or v_prefix !~ '^[A-Z]+$' then
    raise exception 'Invalid serial prefix: %', p_prefix;
  end if;

  v_year := coalesce(
    p_year,
    extract(year from timezone('Asia/Hong_Kong', now()))::integer
  );
  v_yy := lpad((v_year % 100)::text, 2, '0');
  v_lock_key := hashtextextended(v_prefix || v_yy, 0);

  perform pg_advisory_xact_lock(v_lock_key);

  v_seq := 1;
  loop
    select 1
      into v_used
    from public.products
    where serial_number = v_prefix || v_yy || lpad(v_seq::text, 4, '0');

    exit when v_used is null;

    v_seq := v_seq + 1;
    if v_seq > 9999 then
      raise exception 'Serial sequence exhausted for % %', v_prefix, v_yy;
    end if;
  end loop;

  v_serial := v_prefix || v_yy || lpad(v_seq::text, 4, '0');
  return v_serial;
end;
$$;

revoke all on function public.next_product_serial(text, integer) from public;
grant execute on function public.next_product_serial(text, integer) to authenticated;

create or replace function public.preview_next_product_serial(
  p_prefix text,
  p_year integer default null
)
returns text
language sql
security definer
set search_path = public
as $$
  select public.next_product_serial(p_prefix, p_year);
$$;

revoke all on function public.preview_next_product_serial(text, integer) from public;
grant execute on function public.preview_next_product_serial(text, integer) to authenticated;

-- ---------------------------------------------------------------------------
-- Jewelry type prefix:
-- first type with starting letter L → L
-- second type sharing L → first two letters
-- third → three letters, etc.
-- "W" reserved for watches.
-- ---------------------------------------------------------------------------
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
  if v_first = 'W' then
    v_len := greatest(v_len, least(2, char_length(v_clean)));
  end if;

  select coalesce(array_agg(upper(serial_prefix)), '{}')
    into v_taken
  from public.jewelry_types
  where serial_prefix is not null
    and id is distinct from new.id;

  v_taken := v_taken || array['W'];

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

drop trigger if exists jewelry_types_assign_serial_prefix on public.jewelry_types;
create trigger jewelry_types_assign_serial_prefix
before insert on public.jewelry_types
for each row
execute function public.assign_jewelry_type_serial_prefix();

-- ---------------------------------------------------------------------------
-- Assign serial on product insert; never change on update once set
-- ---------------------------------------------------------------------------
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
  else
    if new.jewelry_type_id is null then
      raise exception 'Jewelry products require a jewelry type before a serial can be assigned';
    end if;
    select serial_prefix into v_prefix
    from public.jewelry_types
    where id = new.jewelry_type_id;
    if v_prefix is null then
      raise exception 'Jewelry type not found for serial assignment';
    end if;
  end if;

  new.serial_number := public.next_product_serial(v_prefix);
  return new;
end;
$$;

drop trigger if exists products_assign_serial_number on public.products;
create trigger products_assign_serial_number
before insert or update on public.products
for each row
execute function public.assign_product_serial_number();

-- ---------------------------------------------------------------------------
-- Backfill jewelry type prefixes (creation order)
-- ---------------------------------------------------------------------------
do $$
declare
  r record;
  v_clean text;
  v_first text;
  v_same_count integer;
  v_len integer;
  v_candidate text;
  v_taken text[] := array['W'];
begin
  for r in
    select id, name
    from public.jewelry_types
    where serial_prefix is null
    order by created_at asc, id asc
  loop
    v_clean := regexp_replace(r.name, '[^A-Za-z]', '', 'g');
    if v_clean = '' then
      raise exception 'Cannot backfill prefix for jewelry type %', r.id;
    end if;

    v_first := upper(substr(v_clean, 1, 1));

    select count(*)::integer
      into v_same_count
    from public.jewelry_types
    where serial_prefix is not null
      and upper(substr(regexp_replace(name, '[^A-Za-z]', '', 'g'), 1, 1)) = v_first;

    v_len := least(1 + v_same_count, char_length(v_clean));
    if v_first = 'W' then
      v_len := greatest(v_len, least(2, char_length(v_clean)));
    end if;

    v_candidate := upper(substr(v_clean, 1, v_len));
    while v_candidate = any (v_taken) and v_len < char_length(v_clean) loop
      v_len := v_len + 1;
      v_candidate := upper(substr(v_clean, 1, v_len));
    end loop;

    if v_candidate = any (v_taken) then
      raise exception 'Cannot backfill unique prefix for %', r.name;
    end if;

    update public.jewelry_types
    set serial_prefix = v_candidate
    where id = r.id;

    v_taken := v_taken || v_candidate;
  end loop;
end;
$$;

alter table public.jewelry_types
  alter column serial_prefix set not null;

create unique index if not exists jewelry_types_serial_prefix_unique_idx
  on public.jewelry_types (upper(serial_prefix));

alter table public.jewelry_types
  drop constraint if exists jewelry_types_serial_prefix_format;
alter table public.jewelry_types
  add constraint jewelry_types_serial_prefix_format
  check (serial_prefix ~ '^[A-Z]+$');

-- ---------------------------------------------------------------------------
-- Backfill product serials with trigger disabled
-- ---------------------------------------------------------------------------
alter table public.products disable trigger products_assign_serial_number;

do $$
declare
  r record;
  v_prefix text;
  v_yy text;
  v_seq integer;
  v_serial text;
  v_counters jsonb := '{}'::jsonb;
  v_key text;
begin
  for r in
    select
      p.id,
      p.category,
      p.created_at,
      jt.serial_prefix
    from public.products p
    left join public.jewelry_types jt on jt.id = p.jewelry_type_id
    where p.serial_number is null
    order by p.created_at asc, p.id asc
  loop
    if r.category = 'watch' then
      v_prefix := 'W';
    else
      v_prefix := coalesce(r.serial_prefix, 'J');
    end if;

    v_yy := lpad(
      (extract(year from timezone('Asia/Hong_Kong', r.created_at))::integer % 100)::text,
      2,
      '0'
    );
    v_key := v_prefix || v_yy;
    v_seq := coalesce((v_counters ->> v_key)::integer, 0) + 1;
    v_counters := jsonb_set(v_counters, array[v_key], to_jsonb(v_seq));
    v_serial := v_prefix || v_yy || lpad(v_seq::text, 4, '0');

    update public.products
    set serial_number = v_serial
    where id = r.id;
  end loop;
end;
$$;

alter table public.products enable trigger products_assign_serial_number;

alter table public.products
  alter column serial_number set not null;

create unique index if not exists products_serial_number_unique_idx
  on public.products (serial_number);

create index if not exists products_serial_number_idx
  on public.products (serial_number);

alter table public.products
  drop constraint if exists products_serial_number_format;
alter table public.products
  add constraint products_serial_number_format
  check (serial_number ~ '^[A-Z]+[0-9]{6}$');
