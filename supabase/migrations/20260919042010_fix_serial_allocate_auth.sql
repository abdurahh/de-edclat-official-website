-- Allow trigger-driven allocation without JWT admin claim on internal path.
-- Public RPCs still require is_admin().

create or replace function public.allocate_product_serial_internal(
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

revoke all on function public.allocate_product_serial_internal(text, integer) from public;

create or replace function public.next_product_serial(
  p_prefix text,
  p_year integer default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized to allocate serial numbers';
  end if;
  return public.allocate_product_serial_internal(p_prefix, p_year);
end;
$$;

create or replace function public.preview_next_product_serial(
  p_prefix text,
  p_year integer default null
)
returns text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not authorized to preview serial numbers';
  end if;
  return public.allocate_product_serial_internal(p_prefix, p_year);
end;
$$;

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

  new.serial_number := public.allocate_product_serial_internal(v_prefix);
  return new;
end;
$$;
