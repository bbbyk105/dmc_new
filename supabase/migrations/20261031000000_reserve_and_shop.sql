-- 予約（CAMU・花夢・Chloe）とネットショップ（物販・配送あり）。
--
-- 読み書きはサーバー（service role）からだけ行う。どのテーブルも RLS を有効にしてポリシーは置かないので、
-- ブラウザに出ている anon key では読めない（予約・注文にはお客さまの名前・連絡先・住所が入る）。
-- 関数も anon / authenticated からは呼べないようにする（末尾の revoke）。
--
-- 支払いは Stripe Checkout。払っているあいだは枠と在庫を仮押さえ（pending）にし、
-- Stripe から決済完了が届いたら確定（confirmed / paid）にする。

create schema if not exists extensions;
-- 同じ resource（スタッフ・部屋）の予約の時間が重ならないようにする排他制約に使う
create extension if not exists btree_gist with schema extensions;

-- ---------------------------------------------------------------------------
-- 予約
-- ---------------------------------------------------------------------------

-- 予約できるサービス。id は URL（/reserve/camu）にも使う
create table public.services (
  id text primary key check (id ~ '^[a-z0-9-]+$'),
  name_ja text not null,
  name_en text not null,
  summary_ja text not null default '',
  summary_en text not null default '',
  -- 同じ resource の予約は時間が重ならない（CAMU と花夢は同じスタッフ、Chloe は 2 階の部屋）
  resource text not null,
  -- 開始できる時刻（日本時間・HH:MM）
  start_times text[] not null default '{}'
    check (array_to_string(start_times, ',') ~ '^([0-2][0-9]:[0-5][0-9](,[0-2][0-9]:[0-5][0-9])*)?$'),
  -- この時刻までに終わる枠だけを出す（日本時間・HH:MM）
  closes_at text not null default '17:00' check (closes_at ~ '^[0-2][0-9]:[0-5][0-9]$'),
  -- 予約を受ける曜日（0 = 日曜）
  weekdays smallint[] not null default '{0,1,2,3,4,5,6}',
  -- 開始の何時間前で締め切るか
  lead_hours integer not null default 72 check (lead_hours >= 0),
  -- 何日先まで受けるか
  max_advance_days integer not null default 90 check (max_advance_days > 0),
  sort integer not null default 0,
  active boolean not null default true
);

-- サービスの中のプラン（料金・時間）
create table public.service_options (
  id uuid primary key default gen_random_uuid(),
  service_id text not null references public.services (id) on delete cascade,
  name_ja text not null,
  name_en text not null,
  summary_ja text not null default '',
  summary_en text not null default '',
  duration_minutes integer not null check (duration_minutes > 0),
  -- 1 人目の料金（税込・円）
  price integer not null check (price >= 0),
  -- 2 人目から 1 人ごとに足す料金（税込・円）
  extra_person_price integer not null default 0 check (extra_person_price >= 0),
  max_people integer not null default 1 check (max_people between 1 and 50),
  sort integer not null default 0,
  active boolean not null default true
);

create index service_options_service_id_idx on public.service_options (service_id);

-- 休みの日。resource が null の日は全部の予約を止める
create table public.closed_dates (
  id bigint generated always as identity primary key,
  date date not null,
  resource text,
  note text not null default '',
  created_at timestamptz not null default now()
);

create unique index closed_dates_date_resource_key on public.closed_dates (date, coalesce(resource, ''));

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  -- お客さまに見せる予約番号
  code text not null unique,
  service_id text not null references public.services (id),
  option_id uuid not null references public.service_options (id),
  resource text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  people integer not null check (people >= 1),
  -- 税込・円
  amount integer not null check (amount >= 0),
  -- pending: Stripe で支払い中（仮押さえ） / confirmed: 確定 / cancelled: 取消 / expired: 支払われずに期限切れ
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'expired')),
  -- 仮押さえの期限。過ぎたら次の予約のときに expired にする
  hold_expires_at timestamptz,
  -- Stripe の画面から戻ってきたときに仮押さえを外すための鍵
  release_token text unique,
  -- 仮押さえの数を接続元ごとに抑えるための、IP のハッシュ
  client_key text,
  -- web: お客さまがサイトから / admin: お店が電話などで受けて登録
  source text not null default 'web' check (source in ('web', 'admin')),
  customer_name text not null,
  customer_email text not null default '',
  customer_phone text not null default '',
  customer_note text not null default '',
  locale text not null default 'ja' check (locale in ('ja', 'en')),
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  cancellation_fee integer check (cancellation_fee >= 0),
  refunded_amount integer not null default 0 check (refunded_amount >= 0),
  -- 予約の変更は 1 回まで（キャンセルポリシー）
  change_count integer not null default 0,
  admin_note text not null default '',
  -- conflict: 支払いの途中で枠が取られて自動で取消 / admin: お店が取消
  cancel_reason text check (cancel_reason in ('conflict', 'admin')),
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  check (ends_at > starts_at),
  -- 二重予約をデータベースで止める。払っている途中（pending）の枠も埋まっている扱い
  constraint bookings_no_overlap exclude using gist (
    resource with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  ) where (status in ('pending', 'confirmed'))
);

create index bookings_starts_at_idx on public.bookings (starts_at);
create index bookings_pending_idx on public.bookings (hold_expires_at) where status = 'pending';

-- 期限の過ぎた仮押さえを外す（Stripe の画面を閉じたまま戻らなかった人の枠を空ける）
create function public.expire_stale_bookings()
returns void
language sql
set search_path = public
as $$
  update public.bookings
     set status = 'expired', hold_expires_at = null
   where status = 'pending' and hold_expires_at < now();
$$;

-- 枠を仮押さえする。料金はプランから計算する（ブラウザから送られた金額は使わない）。
-- 枠が埋まっていれば排他制約で exclusion_violation（23P01）になる。
-- 開始時刻・曜日・締切・休みの日の確認はサーバー（lib/reserve/schedule.ts）で済ませてから呼ぶ
create function public.hold_booking(
  p_service_id text,
  p_option_id uuid,
  p_starts_at timestamptz,
  p_people integer,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_note text,
  p_locale text,
  p_code text,
  p_release_token text,
  p_client_key text,
  p_hold_minutes integer default 31,
  p_max_holds integer default 3
)
returns public.bookings
language plpgsql
set search_path = public
as $$
declare
  v_service public.services;
  v_option public.service_options;
  v_booking public.bookings;
begin
  select * into v_service from public.services where id = p_service_id and active;
  if not found then
    raise exception 'service_not_found';
  end if;

  select * into v_option
    from public.service_options
   where id = p_option_id and service_id = p_service_id and active;
  if not found then
    raise exception 'option_not_found';
  end if;

  if p_people is null or p_people < 1 or p_people > v_option.max_people then
    raise exception 'invalid_people';
  end if;

  perform public.expire_stale_bookings();

  if p_client_key is not null and (
    select count(*) from public.bookings where client_key = p_client_key and status = 'pending'
  ) >= p_max_holds then
    raise exception 'too_many_holds';
  end if;

  insert into public.bookings (
    code, service_id, option_id, resource, starts_at, ends_at, people, amount,
    status, hold_expires_at, release_token, client_key, source,
    customer_name, customer_email, customer_phone, customer_note, locale
  ) values (
    p_code, p_service_id, p_option_id, v_service.resource, p_starts_at,
    p_starts_at + make_interval(mins => v_option.duration_minutes),
    p_people,
    v_option.price + v_option.extra_person_price * (p_people - 1),
    'pending', now() + make_interval(mins => p_hold_minutes), p_release_token, p_client_key, 'web',
    p_customer_name, p_customer_email, p_customer_phone, p_customer_note, p_locale
  )
  returning * into v_booking;

  return v_booking;
end;
$$;

-- Stripe で払い終わった予約を確定する。Webhook と完了ページの両方から呼ばれるので、何度呼んでも一度だけ確定する。
-- result:
--   confirmed  … いま確定した（メールを送る）
--   already    … もう確定していた
--   conflict   … 仮押さえの期限切れのあいだに別の予約が入っていた（全額返金が要る）
--   cancelled  … 取り消し済み
--   not_found
create function public.confirm_booking(p_session_id text, p_payment_intent_id text)
returns table (result text, booking_id uuid)
language plpgsql
set search_path = public
as $$
declare
  v public.bookings;
begin
  select * into v from public.bookings where stripe_session_id = p_session_id for update;
  if not found then
    return query select 'not_found'::text, null::uuid;
    return;
  end if;

  if v.status = 'confirmed' then
    return query select 'already'::text, v.id;
    return;
  end if;

  if v.status = 'cancelled' then
    return query select 'cancelled'::text, v.id;
    return;
  end if;

  begin
    update public.bookings
       set status = 'confirmed',
           confirmed_at = now(),
           hold_expires_at = null,
           stripe_payment_intent_id = p_payment_intent_id
     where id = v.id;
  exception when exclusion_violation then
    update public.bookings
       set status = 'cancelled',
           cancel_reason = 'conflict',
           cancelled_at = now(),
           cancellation_fee = 0,
           stripe_payment_intent_id = p_payment_intent_id,
           admin_note = '支払いの途中で仮押さえの期限が切れ、そのあいだに同じ時間の予約が入ったため取り消し（全額返金）'
     where id = v.id;
    return query select 'conflict'::text, v.id;
    return;
  end;

  return query select 'confirmed'::text, v.id;
end;
$$;

-- お店が予約を取り消す。確定している予約にだけ一度効く（二度押し・二人で同時に押しても、記録とメールは一度）。
-- 返金（Stripe）は先に済ませてから、その金額を渡す
create function public.cancel_booking(p_booking_id uuid, p_fee integer, p_refund integer, p_reason text)
returns boolean
language plpgsql
set search_path = public
as $$
begin
  update public.bookings
     set status = 'cancelled',
         cancel_reason = p_reason,
         cancelled_at = now(),
         cancellation_fee = p_fee,
         refunded_amount = refunded_amount + p_refund
   where id = p_booking_id and status = 'confirmed';
  return found;
end;
$$;

-- Stripe の画面から戻ってきた人の仮押さえを外す（Stripe のセッションを先に失効させてから呼ぶ）
create function public.release_booking(p_release_token text)
returns setof public.bookings
language sql
set search_path = public
as $$
  update public.bookings
     set status = 'expired', hold_expires_at = null
   where release_token = p_release_token and status = 'pending'
  returning *;
$$;

-- ---------------------------------------------------------------------------
-- ネットショップ
-- ---------------------------------------------------------------------------

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_ja text not null,
  name_en text not null default '',
  description_ja text not null default '',
  description_en text not null default '',
  -- 税込・円
  price integer not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  -- Storage（shop-images バケット）のパス。先頭が一覧の写真
  images text[] not null default '{}',
  -- 公開するか（作ってすぐは非公開）
  active boolean not null default false,
  sort integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 送料と発送の目安（1 行だけ）
create table public.shop_settings (
  id boolean primary key default true check (id),
  shipping_fee integer not null default 800 check (shipping_fee >= 0),
  -- この金額以上で送料無料（null なら無料にしない）
  free_shipping_threshold integer check (free_shipping_threshold > 0),
  delivery_note_ja text not null default 'ご注文から3営業日以内に発送します。',
  delivery_note_en text not null default 'Orders ship within 3 business days.',
  updated_at timestamptz not null default now()
);

insert into public.shop_settings default values;

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  -- pending: Stripe で支払い中（在庫を仮押さえ） / paid: 支払い済み / shipped: 発送済み / cancelled: 取消 / expired: 支払われずに期限切れ
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'cancelled', 'expired')),
  hold_expires_at timestamptz,
  release_token text unique,
  client_key text,
  subtotal integer not null default 0 check (subtotal >= 0),
  shipping_fee integer not null default 0 check (shipping_fee >= 0),
  total integer not null default 0 check (total >= 0),
  locale text not null default 'ja' check (locale in ('ja', 'en')),
  -- 連絡先と届け先は Stripe の画面で入れてもらい、支払い後に写す
  customer_email text not null default '',
  customer_name text not null default '',
  customer_phone text not null default '',
  shipping_name text not null default '',
  shipping_postal_code text not null default '',
  shipping_address text not null default '',
  stripe_session_id text unique,
  stripe_payment_intent_id text,
  refunded_amount integer not null default 0 check (refunded_amount >= 0),
  -- この注文の分の在庫を減らしてあるか（取消・期限切れで戻すのは、これが true のときだけ）
  stock_reserved boolean not null default false,
  tracking_number text not null default '',
  -- 在庫が足りないまま支払われたなど、お店が確認すべき注文
  needs_attention boolean not null default false,
  admin_note text not null default '',
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  shipped_at timestamptz,
  cancelled_at timestamptz
);

create index orders_created_at_idx on public.orders (created_at desc);
create index orders_pending_idx on public.orders (hold_expires_at) where status = 'pending';

create table public.order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  -- 注文した時点の名前と値段を残す
  name_ja text not null,
  name_en text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0)
);

create index order_items_order_id_idx on public.order_items (order_id);

-- 注文の在庫を戻す（期限切れ・取消のとき）。押さえている注文だけ、一度だけ戻す
create function public.restock_order(p_order_id uuid)
returns void
language plpgsql
set search_path = public
as $$
begin
  update public.orders set stock_reserved = false where id = p_order_id and stock_reserved;
  if not found then
    return;
  end if;
  update public.products p
     set stock = p.stock + i.quantity, updated_at = now()
    from (
      select oi.product_id, sum(oi.quantity)::integer as quantity
        from public.order_items oi
       where oi.order_id = p_order_id
       group by oi.product_id
    ) i
   where p.id = i.product_id;
end;
$$;

-- 期限の過ぎた仮押さえの注文を外し、在庫を戻す
create function public.expire_stale_orders()
returns void
language plpgsql
set search_path = public
as $$
declare
  v_id uuid;
begin
  for v_id in
    update public.orders
       set status = 'expired', hold_expires_at = null
     where status = 'pending' and hold_expires_at < now()
    returning id
  loop
    perform public.restock_order(v_id);
  end loop;
end;
$$;

-- カートの中身で注文を仮押さえする。値段・送料はデータベースの値で計算し、在庫をその場で減らす。
-- p_items: [{"product_id": "...", "quantity": 1}, ...]
-- 在庫が足りなければ 'out_of_stock:<product_id>' で失敗し、減らした在庫も戻る（関数全体が 1 つのトランザクション）
create function public.hold_order(
  p_items jsonb,
  p_locale text,
  p_code text,
  p_release_token text,
  p_client_key text,
  p_hold_minutes integer default 31,
  p_max_holds integer default 3
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
  v_lines integer := 0;
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

  insert into public.orders (code, status, hold_expires_at, release_token, client_key, locale)
  values (p_code, 'pending', now() + make_interval(mins => p_hold_minutes), p_release_token, p_client_key, p_locale)
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
    v_lines := v_lines + 1;
  end loop;

  select * into v_settings from public.shop_settings where id;
  v_shipping := case
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

-- Stripe で払い終わった注文を支払い済みにする。何度呼んでも一度だけ変わる。
-- 仮押さえの期限切れで在庫を戻したあとに支払いが届いたときは、在庫を減らし直す。
-- 一つでも足りなければどの商品も減らさず、支払い済みのまま needs_attention を立てる（お店が返金か取り寄せを決める）。
-- result: paid（いま支払い済みにした） / already / cancelled / not_found
create function public.mark_order_paid(
  p_session_id text,
  p_payment_intent_id text,
  p_customer_email text,
  p_customer_name text,
  p_customer_phone text,
  p_shipping_name text,
  p_shipping_postal_code text,
  p_shipping_address text
)
returns table (result text, order_id uuid)
language plpgsql
set search_path = public
as $$
declare
  v public.orders;
  v_short boolean := false;
  v_reserved boolean;
begin
  select * into v from public.orders where stripe_session_id = p_session_id for update;
  if not found then
    return query select 'not_found'::text, null::uuid;
    return;
  end if;

  if v.status in ('paid', 'shipped') then
    return query select 'already'::text, v.id;
    return;
  end if;

  if v.status = 'cancelled' then
    return query select 'cancelled'::text, v.id;
    return;
  end if;

  v_reserved := v.stock_reserved;
  if v.status = 'expired' then
    -- ほかの注文と同時に減らさないよう商品の行を押さえてから、全部足りるかを確かめる。
    -- 戻り値の列名（order_id）とぶつからないよう、列は別名で書く
    perform 1 from public.products p
     where p.id in (select oi.product_id from public.order_items oi where oi.order_id = v.id)
       for update;
    select exists (
      select 1
        from (select oi.product_id, sum(oi.quantity)::integer as quantity
                from public.order_items oi where oi.order_id = v.id group by oi.product_id) i
        join public.products p on p.id = i.product_id
       where p.stock < i.quantity
    ) into v_short;
    if not v_short then
      update public.products p
         set stock = p.stock - i.quantity, updated_at = now()
        from (select oi.product_id, sum(oi.quantity)::integer as quantity
                from public.order_items oi where oi.order_id = v.id group by oi.product_id) i
       where p.id = i.product_id;
      v_reserved := true;
    end if;
  end if;

  update public.orders
     set status = 'paid',
         paid_at = now(),
         hold_expires_at = null,
         stripe_payment_intent_id = p_payment_intent_id,
         customer_email = coalesce(p_customer_email, ''),
         customer_name = coalesce(p_customer_name, ''),
         customer_phone = coalesce(p_customer_phone, ''),
         shipping_name = coalesce(p_shipping_name, ''),
         shipping_postal_code = coalesce(p_shipping_postal_code, ''),
         shipping_address = coalesce(p_shipping_address, ''),
         stock_reserved = v_reserved,
         needs_attention = v_short,
         admin_note = case when v_short
           then '支払いの途中で仮押さえの期限が切れ、在庫が足りなくなった。返金か取り寄せを決める'
           else admin_note end
   where id = v.id;

  return query select 'paid'::text, v.id;
end;
$$;

-- お店が注文を取り消す。支払い済み・発送済みの注文にだけ一度効く。
-- 発送前なら押さえた在庫を戻す（発送済みの商品は手元に無いので戻さない）。返金（Stripe）は先に済ませてから金額を渡す
create function public.cancel_order(p_order_id uuid, p_refund integer default 0)
returns boolean
language plpgsql
set search_path = public
as $$
declare
  v public.orders;
begin
  select * into v from public.orders where id = p_order_id for update;
  if not found or v.status not in ('paid', 'shipped') then
    return false;
  end if;
  update public.orders
     set status = 'cancelled', cancelled_at = now(), refunded_amount = refunded_amount + p_refund
   where id = v.id;
  if v.status = 'paid' then
    perform public.restock_order(v.id);
  end if;
  return true;
end;
$$;

-- Stripe の画面から戻ってきた人の注文の仮押さえを外し、在庫を戻す
create function public.release_order(p_release_token text)
returns setof public.orders
language plpgsql
set search_path = public
as $$
declare
  v public.orders;
begin
  update public.orders
     set status = 'expired', hold_expires_at = null
   where release_token = p_release_token and status = 'pending'
  returning * into v;
  if found then
    perform public.restock_order(v.id);
    return next v;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- 権限：サーバー（service role）だけが読み書きする
-- ---------------------------------------------------------------------------

alter table public.services enable row level security;
alter table public.service_options enable row level security;
alter table public.closed_dates enable row level security;
alter table public.bookings enable row level security;
alter table public.products enable row level security;
alter table public.shop_settings enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

revoke execute on function public.expire_stale_bookings() from public, anon, authenticated;
revoke execute on function public.hold_booking(text, uuid, timestamptz, integer, text, text, text, text, text, text, text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.confirm_booking(text, text) from public, anon, authenticated;
revoke execute on function public.cancel_booking(uuid, integer, integer, text) from public, anon, authenticated;
revoke execute on function public.cancel_order(uuid, integer) from public, anon, authenticated;
revoke execute on function public.release_booking(text) from public, anon, authenticated;
revoke execute on function public.restock_order(uuid) from public, anon, authenticated;
revoke execute on function public.expire_stale_orders() from public, anon, authenticated;
revoke execute on function public.hold_order(jsonb, text, text, text, text, integer, integer) from public, anon, authenticated;
revoke execute on function public.mark_order_paid(text, text, text, text, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.release_order(text) from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- 初めの設定（2026-10-30 時点の Wix の予約サイトと同じ。料金はサイトのサービスページと同じ）。
-- 水曜日は定休日なので、どのサービスも予約を受けない（weekdays から 3 を外す。管理画面の「受付の設定」で変えられる）
-- ---------------------------------------------------------------------------

insert into public.services (id, name_ja, name_en, summary_ja, summary_en, resource, start_times, closes_at, weekdays, lead_hours, sort) values
  ('camu', 'CAMU – 富士山と着物の撮影体験', 'CAMU – Mt. Fuji Kimono Photo Experience',
   '富士山と茶畑のロケーション、スタジオでの撮影を組み合わせた着物の撮影体験です。',
   'A ceremonial kimono photo experience combining outdoor views of Mt. Fuji and tea fields with a studio session.',
   'kimono', '{11:00,11:30,12:00,12:30,13:00,13:30,14:00}', '17:00', '{0,1,2,4,5,6}', 72, 10),
  ('hanayume', '花夢プラン', 'Hanayume Plan',
   '打掛・ドレスのレンタルとスタジオ（1時間）がセットになったプランです。',
   'Uchikake kimono or dress rental with a one-hour studio session.',
   'kimono', '{14:00,14:30,15:00,15:30,16:00}', '17:00', '{0,1,2,4,5,6}', 72, 20),
  ('chloe', 'Chloe レンタルスタジオ', 'Chloe Rental Studio',
   '2階のレンタルスタジオ。背景セットをご用意しています（カメラマン・メイクは含みません）。',
   'Second-floor rental studio with backdrop sets (photographer and makeup not included).',
   'chloe', '{11:00,11:30,12:00,12:30,13:00,13:30,14:00,14:30,15:00,15:30,16:00}', '17:00', '{0,1,2,4,5,6}', 72, 30);

insert into public.service_options (service_id, name_ja, name_en, summary_ja, summary_en, duration_minutes, price, extra_person_price, max_people, sort) values
  ('camu', 'Kimono Experience', 'Kimono Experience',
   '着物のレンタル（1着目の料金）',
   'Ceremonial kimono rental (price for the first kimono).',
   180, 10000, 5000, 6, 10),
  ('camu', 'Light Plan', 'Light Plan',
   '着物レンタル。ご自身の端末での撮影ができます',
   'Ceremonial kimono rental. Self-shoot with your own device.',
   180, 20000, 20000, 6, 20),
  ('camu', 'Premium Plan', 'Premium Plan',
   'ロケーションまたはスタジオ撮影・着付け・プロの撮影・写真データ10枚',
   'Location or studio session, dressing, professional photo shoot, 10 photo files.',
   180, 100000, 100000, 6, 30),
  ('hanayume', '花夢プラン', 'Hanayume Plan',
   '打掛着物・ドレスのレンタルとスタジオ（1時間）',
   'Uchikake kimono or dress rental with a one-hour studio session.',
   60, 5000, 0, 1, 10),
  ('chloe', '1時間', '1 hour', '', '', 60, 2000, 0, 10, 10),
  ('chloe', '4時間', '4 hours', '', '', 240, 5000, 0, 10, 20);
