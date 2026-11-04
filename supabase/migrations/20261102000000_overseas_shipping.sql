-- 海外発送。商品代だけを先に払ってもらい、送料はお店がご注文のあとにメールで知らせて別に請求する（2026-11-02 決定）。
-- 海外の注文は送料 0 円で確定し、overseas を立てる。管理画面とお店へのメールで「送料の連絡が要る」と出す

alter table public.orders
  add column overseas boolean not null default false;

-- hold_order に「海外発送か」を足す（引数が変わるので、作り直す）
drop function public.hold_order(jsonb, text, text, text, text, integer, integer);

create function public.hold_order(
  p_items jsonb,
  p_locale text,
  p_code text,
  p_release_token text,
  p_client_key text,
  p_hold_minutes integer default 31,
  p_max_holds integer default 3,
  p_overseas boolean default false
)
returns public.orders
language plpgsql
set search_path = public
as $$
declare
  v_item record;
  v_product public.products;
  v_settings public.shop_settings;
  v_order public.orders;
  v_subtotal integer := 0;
  v_shipping integer;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'empty_cart';
  end if;
  if jsonb_array_length(p_items) > 50 then
    raise exception 'too_many_items';
  end if;

  perform public.expire_stale_orders();

  if p_client_key is not null and (
    select count(*) from public.orders where client_key = p_client_key and status = 'pending'
  ) >= p_max_holds then
    raise exception 'too_many_holds';
  end if;

  insert into public.orders (code, status, hold_expires_at, release_token, client_key, locale, overseas)
  values (p_code, 'pending', now() + make_interval(mins => p_hold_minutes), p_release_token, p_client_key, p_locale, coalesce(p_overseas, false))
  returning * into v_order;

  for v_item in
    select (e ->> 'product_id')::uuid as product_id, (e ->> 'quantity')::integer as quantity
      from jsonb_array_elements(p_items) as e
  loop
    if v_item.quantity is null or v_item.quantity < 1 or v_item.quantity > 99 then
      raise exception 'invalid_quantity';
    end if;

    update public.products
       set stock = stock - v_item.quantity, updated_at = now()
     where id = v_item.product_id and active and stock >= v_item.quantity
    returning * into v_product;
    if not found then
      raise exception 'out_of_stock:%', v_item.product_id;
    end if;

    insert into public.order_items (order_id, product_id, name_ja, name_en, unit_price, quantity)
    values (v_order.id, v_product.id, v_product.name_ja, v_product.name_en, v_product.price, v_item.quantity);

    v_subtotal := v_subtotal + v_product.price * v_item.quantity;
  end loop;

  -- 海外は送料をあとで別に請求するので、ここでは 0 円
  select * into v_settings from public.shop_settings where id;
  v_shipping := case
    when coalesce(p_overseas, false) then 0
    when v_settings.free_shipping_threshold is not null and v_subtotal >= v_settings.free_shipping_threshold then 0
    else v_settings.shipping_fee
  end;

  update public.orders
     set subtotal = v_subtotal, shipping_fee = v_shipping, total = v_subtotal + v_shipping, stock_reserved = true
   where id = v_order.id
  returning * into v_order;

  return v_order;
end;
$$;

revoke execute on function public.hold_order(jsonb, text, text, text, text, integer, integer, boolean) from public, anon, authenticated;
