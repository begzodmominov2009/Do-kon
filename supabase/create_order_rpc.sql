-- create_order RPC
--
-- Atomically does all four things an order requires:
--   1. insert the order row (order_number is left out — the existing
--      trigger on `orders` already fills it in)
--   2. insert one order_items row per line item, using the product name /
--      color / price / image already snapshotted by the caller
--   3. decrement products.stock for each item, failing the whole
--      transaction if stock has run out in the meantime
--   4. increment promo_codes.used_count if a promo code was applied,
--      failing the whole transaction if it has just been exhausted
--
-- Being a single PL/pgSQL function, all of this runs inside one implicit
-- transaction: any `raise exception` below rolls back everything that
-- happened earlier in the same call (the order insert, any order_items
-- already inserted, any stock already decremented).
--
-- app/api/order/route.ts has already validated stock/price/promo BEFORE
-- calling this — the checks here are the atomic, race-safe backstop for
-- the (rare) case where two requests interleave between that check and
-- this write.

create or replace function public.create_order(
  p_customer_name text,
  p_phone text,
  p_region text,
  p_district text,
  p_street text,
  p_note text,
  p_items jsonb,          -- [{product_id, product_name, color_name, color_hex, price, qty, image_url}, ...]
  p_subtotal integer,
  p_discount integer,
  p_delivery_price integer,
  p_total integer,
  p_promo_code text        -- nullable
)
returns table (out_order_id bigint, out_order_number text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id bigint;
  v_order_number text;
  v_item jsonb;
  v_product_id bigint;
  v_qty integer;
  v_updated_rows integer;
  v_promo_updated integer;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_items';
  end if;

  insert into orders (
    customer_name, phone, region, district, street, note,
    subtotal, discount, promo_code, delivery_price, total,
    source, status
  ) values (
    p_customer_name, p_phone, p_region, p_district, p_street, p_note,
    p_subtotal, p_discount, p_promo_code, p_delivery_price, p_total,
    'web', 'new'
  )
  returning id, order_number into v_order_id, v_order_number;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::bigint;
    v_qty := (v_item->>'qty')::integer;

    insert into order_items (
      order_id, product_id, product_name, color_name, color_hex, price, qty, image_url
    ) values (
      v_order_id,
      v_product_id,
      v_item->>'product_name',
      v_item->>'color_name',
      v_item->>'color_hex',
      (v_item->>'price')::integer,
      v_qty,
      v_item->>'image_url'
    );

    -- Atomic check-and-decrement: if another request already dropped stock
    -- below qty since app/api/order's own check, this updates 0 rows.
    update products
      set stock = stock - v_qty
      where id = v_product_id
        and stock >= v_qty;

    get diagnostics v_updated_rows = row_count;
    if v_updated_rows = 0 then
      raise exception 'out_of_stock:%', v_product_id;
    end if;
  end loop;

  if p_promo_code is not null then
    -- Same atomic pattern for the promo code's usage limit.
    update promo_codes
      set used_count = used_count + 1
      where code = p_promo_code
        and is_active = true
        and (max_uses is null or used_count < max_uses);

    get diagnostics v_promo_updated = row_count;
    if v_promo_updated = 0 then
      raise exception 'promo_invalid:%', p_promo_code;
    end if;
  end if;

  return query select v_order_id, v_order_number;
end;
$$;

-- Lock the function down to service_role only. It's security definer (so it
-- can write across RLS-protected tables), which means it must NOT be
-- callable by anon/authenticated — that would be a backdoor around the
-- application-level validation in app/api/order/route.ts.
revoke all on function public.create_order(
  text, text, text, text, text, text, jsonb, integer, integer, integer, integer, text
) from public, anon, authenticated;

grant execute on function public.create_order(
  text, text, text, text, text, text, jsonb, integer, integer, integer, integer, text
) to service_role;
