-- update_order_status RPC
--
-- The single place that changes orders.status. Both the Telegram bot
-- webhook (app/api/telegram/webhook/route.ts, via
-- lib/orders/statusUpdate.ts) and the admin panel must go through this
-- function rather than updating orders.status directly — that's what keeps
-- stock-restore-on-cancel correct and race-safe no matter which side
-- triggers the change.
--
-- Behaviour:
--   * Locks the order row (`for update`) so two simultaneous status changes
--     for the same order can't interleave.
--   * If the order is already in `p_new_status`, does nothing and reports
--     out_changed = false — callers use this to answer "already changed"
--     instead of silently re-sending the same update.
--   * If the new status is 'cancelled' (and the order wasn't already
--     cancelled), restores stock for every line item atomically as part of
--     the same transaction as the status write.
--   * Does not re-decrement stock if a cancelled order's status is somehow
--     changed away from 'cancelled' — that's not a flow the app exposes.

create or replace function public.update_order_status(
  p_order_id bigint,
  p_new_status text
)
returns table (out_changed boolean, out_previous_status text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_current_status text;
  v_item record;
begin
  select status into v_current_status
  from orders
  where id = p_order_id
  for update;

  if not found then
    raise exception 'order_not_found:%', p_order_id;
  end if;

  if v_current_status = p_new_status then
    return query select false, v_current_status;
    return;
  end if;

  if p_new_status = 'cancelled' and v_current_status <> 'cancelled' then
    for v_item in select product_id, qty from order_items where order_id = p_order_id
    loop
      update products set stock = stock + v_item.qty where id = v_item.product_id;
    end loop;
  end if;

  update orders set status = p_new_status where id = p_order_id;

  return query select true, v_current_status;
end;
$$;

-- Same reasoning as create_order: security definer needs to write across
-- RLS-protected tables, so it must stay off-limits to anon/authenticated —
-- only the server (service_role) may call it.
revoke all on function public.update_order_status(bigint, text) from public, anon, authenticated;
grant execute on function public.update_order_status(bigint, text) to service_role;
