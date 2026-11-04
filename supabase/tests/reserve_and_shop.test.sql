-- 予約とショップのデータベースのテスト（supabase test db）。
-- 二重予約が止まること、仮押さえの期限切れ・解除で枠と在庫が戻ること、確定が一度だけ効くことを確かめる。
-- 1 つのトランザクションの中で流すので now() は変わらない。期限切れは hold_expires_at を過去に書き換えて作る
begin;
select plan(47);

create temporary table t_opt as
select
  (select id from public.service_options where service_id = 'camu' and name_en = 'Kimono Experience') as camu_kimono,
  (select id from public.service_options where service_id = 'camu' and name_en = 'Premium Plan') as camu_premium,
  (select id from public.service_options where service_id = 'hanayume') as hanayume,
  (select id from public.service_options where service_id = 'chloe' and duration_minutes = 60) as chloe_1h;

-- ---------------------------------------------------------------------------
-- 予約
-- ---------------------------------------------------------------------------

select lives_ok(
  $$ select public.hold_booking(
       p_service_id => 'camu', p_option_id => (select camu_kimono from t_opt),
       p_starts_at => '2026-12-01 11:00+09', p_people => 3,
       p_customer_name => 'A', p_customer_email => 'a@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST01', p_release_token => 'tok-a', p_client_key => 'ip-a') $$,
  'CAMU 11:00〜14:00 を仮押さえできる'
);

select is(
  (select amount from public.bookings where code = 'R-TEST01'), 20000,
  '料金はプランから計算する（1 着目 ¥10,000 ＋ 2 着目から ¥5,000 × 2）'
);

select is(
  (select ends_at from public.bookings where code = 'R-TEST01'), '2026-12-01 14:00+09'::timestamptz,
  '終わりの時刻はプランの時間（3 時間）から出す'
);

select throws_ok(
  $$ select public.hold_booking(
       p_service_id => 'camu', p_option_id => (select camu_premium from t_opt),
       p_starts_at => '2026-12-01 13:00+09', p_people => 1,
       p_customer_name => 'B', p_customer_email => 'b@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST02', p_release_token => 'tok-b', p_client_key => 'ip-b') $$,
  '23P01', null,
  '支払い中の仮押さえと重なる時間は、ほかの人が予約できない'
);

select throws_ok(
  $$ select public.hold_booking(
       p_service_id => 'hanayume', p_option_id => (select hanayume from t_opt),
       p_starts_at => '2026-12-01 13:30+09', p_people => 1,
       p_customer_name => 'B', p_customer_email => 'b@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST03', p_release_token => 'tok-c', p_client_key => 'ip-b') $$,
  '23P01', null,
  'CAMU と花夢は同じスタッフなので、時間が重なれば予約できない'
);

select lives_ok(
  $$ select public.hold_booking(
       p_service_id => 'hanayume', p_option_id => (select hanayume from t_opt),
       p_starts_at => '2026-12-01 14:00+09', p_people => 1,
       p_customer_name => 'B', p_customer_email => 'b@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST04', p_release_token => 'tok-d', p_client_key => 'ip-b') $$,
  'CAMU が終わる 14:00 からの花夢は予約できる'
);

select lives_ok(
  $$ select public.hold_booking(
       p_service_id => 'chloe', p_option_id => (select chloe_1h from t_opt),
       p_starts_at => '2026-12-01 11:00+09', p_people => 2,
       p_customer_name => 'C', p_customer_email => 'c@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST05', p_release_token => 'tok-e', p_client_key => 'ip-c') $$,
  'Chloe（2 階の部屋）は CAMU と同じ時間でも予約できる'
);

select throws_ok(
  $$ select public.hold_booking(
       p_service_id => 'hanayume', p_option_id => (select hanayume from t_opt),
       p_starts_at => '2026-12-02 14:00+09', p_people => 2,
       p_customer_name => 'D', p_customer_email => 'd@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST06', p_release_token => 'tok-f', p_client_key => 'ip-d') $$,
  'P0001', 'invalid_people',
  'プランの上限を超える人数は受けない'
);

select throws_ok(
  $$ select public.hold_booking(
       p_service_id => 'chloe', p_option_id => (select camu_kimono from t_opt),
       p_starts_at => '2026-12-02 11:00+09', p_people => 1,
       p_customer_name => 'D', p_customer_email => 'd@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST07', p_release_token => 'tok-g', p_client_key => 'ip-d') $$,
  'P0001', 'option_not_found',
  'ほかのサービスのプランは使えない'
);

-- 支払いの済んだ予約を確定する
update public.bookings set stripe_session_id = 'cs_a' where code = 'R-TEST01';

select is(
  (select result from public.confirm_booking('cs_a', 'pi_a')), 'confirmed',
  '支払いが届いたら確定する'
);
select is(
  (select result from public.confirm_booking('cs_a', 'pi_a')), 'already',
  'Webhook と完了ページの両方から呼ばれても、確定は一度だけ'
);
select is(
  (select status from public.bookings where code = 'R-TEST01'), 'confirmed',
  '確定した予約は confirmed'
);

select throws_ok(
  $$ select public.hold_booking(
       p_service_id => 'camu', p_option_id => (select camu_kimono from t_opt),
       p_starts_at => '2026-12-01 12:00+09', p_people => 1,
       p_customer_name => 'E', p_customer_email => 'e@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST08', p_release_token => 'tok-h', p_client_key => 'ip-e') $$,
  '23P01', null,
  '確定した予約と重なる時間は予約できない'
);

-- 期限の過ぎた仮押さえは、次の予約のときに外れる
update public.bookings set hold_expires_at = now() - interval '1 minute' where code = 'R-TEST04';

select lives_ok(
  $$ select public.hold_booking(
       p_service_id => 'hanayume', p_option_id => (select hanayume from t_opt),
       p_starts_at => '2026-12-01 14:30+09', p_people => 1,
       p_customer_name => 'F', p_customer_email => 'f@example.com', p_customer_phone => '0900000000',
       p_customer_note => '', p_locale => 'ja', p_code => 'R-TEST09', p_release_token => 'tok-i', p_client_key => 'ip-f') $$,
  '支払われずに期限の過ぎた仮押さえの枠は、ほかの人が予約できる'
);
select is(
  (select status from public.bookings where code = 'R-TEST04'), 'expired',
  '期限の過ぎた仮押さえは expired になる'
);

-- 期限切れのあいだに枠が取られてから、支払いが届いたとき
update public.bookings set stripe_session_id = 'cs_d' where code = 'R-TEST04';
select is(
  (select result from public.confirm_booking('cs_d', 'pi_d')), 'conflict',
  '期限切れのあいだに同じ時間の予約が入っていたら、確定せずに conflict を返す（全額返金する）'
);
select is(
  (select status from public.bookings where code = 'R-TEST04'), 'cancelled',
  '確定できなかった予約は cancelled'
);

-- 期限切れでも、枠が空いたままなら確定できる
update public.bookings set stripe_session_id = 'cs_e', hold_expires_at = now() - interval '1 minute' where code = 'R-TEST05';
select public.expire_stale_bookings();
select is(
  (select result from public.confirm_booking('cs_e', 'pi_e')), 'confirmed',
  '期限が過ぎてから支払いが届いても、枠が空いていれば確定する'
);

-- Stripe の画面から戻ってきた人の仮押さえを外す
select is(
  (select count(*)::integer from public.release_booking('tok-i')), 1,
  '戻り先の鍵で仮押さえを外せる'
);
select is(
  (select count(*)::integer from public.release_booking('tok-i')), 0,
  '外し終わった仮押さえは、もう一度は外れない'
);
select is(
  (select count(*)::integer from public.release_booking('tok-a')), 0,
  '確定した予約は、戻り先の鍵では外れない'
);

-- 同じ接続元の仮押さえは 3 件まで
select public.hold_booking(
  p_service_id => 'chloe', p_option_id => (select chloe_1h from t_opt), p_starts_at => '2026-12-05 11:00+09', p_people => 1,
  p_customer_name => 'G', p_customer_email => 'g@example.com', p_customer_phone => '0900000000', p_customer_note => '',
  p_locale => 'ja', p_code => 'R-TEST10', p_release_token => 'tok-j', p_client_key => 'ip-g');
select public.hold_booking(
  p_service_id => 'chloe', p_option_id => (select chloe_1h from t_opt), p_starts_at => '2026-12-05 12:00+09', p_people => 1,
  p_customer_name => 'G', p_customer_email => 'g@example.com', p_customer_phone => '0900000000', p_customer_note => '',
  p_locale => 'ja', p_code => 'R-TEST11', p_release_token => 'tok-k', p_client_key => 'ip-g');
select public.hold_booking(
  p_service_id => 'chloe', p_option_id => (select chloe_1h from t_opt), p_starts_at => '2026-12-05 13:00+09', p_people => 1,
  p_customer_name => 'G', p_customer_email => 'g@example.com', p_customer_phone => '0900000000', p_customer_note => '',
  p_locale => 'ja', p_code => 'R-TEST12', p_release_token => 'tok-l', p_client_key => 'ip-g');
select throws_ok(
  $$ select public.hold_booking(
       p_service_id => 'chloe', p_option_id => (select chloe_1h from t_opt), p_starts_at => '2026-12-05 14:00+09', p_people => 1,
       p_customer_name => 'G', p_customer_email => 'g@example.com', p_customer_phone => '0900000000', p_customer_note => '',
       p_locale => 'ja', p_code => 'R-TEST13', p_release_token => 'tok-m', p_client_key => 'ip-g') $$,
  'P0001', 'too_many_holds',
  '同じ接続元から仮押さえを 4 件以上はできない（枠の買い占めを止める）'
);

-- ---------------------------------------------------------------------------
-- ショップ
-- ---------------------------------------------------------------------------

insert into public.products (id, slug, name_ja, price, stock, active) values
  ('00000000-0000-4000-8000-000000000001', 'test-a', '商品A', 3000, 5, true),
  ('00000000-0000-4000-8000-000000000002', 'test-b', '商品B', 9000, 1, true),
  ('00000000-0000-4000-8000-000000000003', 'test-c', '商品C', 1000, 9, false);
update public.shop_settings set shipping_fee = 800, free_shipping_threshold = 10000;

select lives_ok(
  $$ select public.hold_order(
       '[{"product_id": "00000000-0000-4000-8000-000000000001", "quantity": 2}]'::jsonb,
       'ja', 'S-TEST01', 'otok-a', 'ip-s1') $$,
  '在庫のある商品で注文を仮押さえできる'
);
select results_eq(
  $$ select subtotal, shipping_fee, total from public.orders where code = 'S-TEST01' $$,
  $$ values (6000, 800, 6800) $$,
  '小計・送料・合計はデータベースの値段と送料で出す'
);
select is(
  (select stock from public.products where slug = 'test-a'), 3,
  '仮押さえのあいだ在庫を減らす'
);

select throws_ok(
  $$ select public.hold_order(
       '[{"product_id": "00000000-0000-4000-8000-000000000001", "quantity": 1},
         {"product_id": "00000000-0000-4000-8000-000000000002", "quantity": 2}]'::jsonb,
       'ja', 'S-TEST02', 'otok-b', 'ip-s2') $$,
  'P0001', 'out_of_stock:00000000-0000-4000-8000-000000000002',
  '在庫の足りない商品があれば、注文できない'
);
select is(
  (select stock from public.products where slug = 'test-a'), 3,
  '注文できなかったときは、先に減らした在庫も戻る'
);

select throws_ok(
  $$ select public.hold_order(
       '[{"product_id": "00000000-0000-4000-8000-000000000003", "quantity": 1}]'::jsonb,
       'ja', 'S-TEST03', 'otok-c', 'ip-s2') $$,
  'P0001', 'out_of_stock:00000000-0000-4000-8000-000000000003',
  '非公開の商品は注文できない'
);

select public.hold_order(
  '[{"product_id": "00000000-0000-4000-8000-000000000001", "quantity": 1},
    {"product_id": "00000000-0000-4000-8000-000000000002", "quantity": 1}]'::jsonb,
  'ja', 'S-TEST04', 'otok-d', 'ip-s3');
select results_eq(
  $$ select subtotal, shipping_fee, total from public.orders where code = 'S-TEST04' $$,
  $$ values (12000, 0, 12000) $$,
  '小計が送料無料の金額以上なら、送料は 0 円'
);

-- 戻ってきた人の仮押さえを外すと在庫が戻る
select public.release_order('otok-a');
select is(
  (select stock from public.products where slug = 'test-a'), 4,
  '仮押さえを外すと在庫が戻る（S-TEST04 の 1 個は押さえたまま）'
);

-- 支払い済みにする（一度だけ）
update public.orders set stripe_session_id = 'cs_s4' where code = 'S-TEST04';
select is(
  (select result from public.mark_order_paid('cs_s4', 'pi_s4', 'x@example.com', 'X', '0900000000', 'X', '417-0043', '静岡県 富士市')),
  'paid', '支払いが届いたら支払い済みにする'
);
select is(
  (select result from public.mark_order_paid('cs_s4', 'pi_s4', 'x@example.com', 'X', '0900000000', 'X', '417-0043', '静岡県 富士市')),
  'already', '支払い済みは一度だけ'
);

-- 期限切れで在庫を戻したあと、ほかの人が買ってから支払いが届いた
select public.hold_order(
  '[{"product_id": "00000000-0000-4000-8000-000000000001", "quantity": 4}]'::jsonb,
  'ja', 'S-TEST05', 'otok-e', 'ip-s4');
update public.orders set stripe_session_id = 'cs_s5', hold_expires_at = now() - interval '1 minute' where code = 'S-TEST05';
select public.expire_stale_orders();
update public.products set stock = 1 where slug = 'test-a';
select is(
  (select result from public.mark_order_paid('cs_s5', 'pi_s5', 'y@example.com', 'Y', '0900000000', 'Y', '417-0043', '静岡県 富士市')),
  'paid', '期限切れのあとに届いた支払いも、支払い済みにする'
);
select is(
  (select needs_attention from public.orders where code = 'S-TEST05'), true,
  '在庫が足りなくなっていれば、お店の確認が要る印を立てる'
);

-- 期限切れのあとに届いた支払いで、一部の商品だけ在庫が足りないときは、どの商品の在庫も減らさない
-- （取消のときに戻す数が、実際に押さえた数と食い違わないように）
insert into public.products (id, slug, name_ja, price, stock, active) values
  ('00000000-0000-4000-8000-000000000004', 'test-d', '商品D', 1000, 5, true),
  ('00000000-0000-4000-8000-000000000005', 'test-e', '商品E', 1000, 1, true);
select public.hold_order(
  '[{"product_id": "00000000-0000-4000-8000-000000000004", "quantity": 2},
    {"product_id": "00000000-0000-4000-8000-000000000005", "quantity": 1}]'::jsonb,
  'ja', 'S-TEST06', 'otok-f', 'ip-s5');
update public.orders set stripe_session_id = 'cs_s6', hold_expires_at = now() - interval '1 minute' where code = 'S-TEST06';
select public.expire_stale_orders();
update public.products set stock = 0 where slug = 'test-e';
select public.mark_order_paid('cs_s6', 'pi_s6', 'z@example.com', 'Z', '0900000000', 'Z', '417-0043', '静岡県 富士市');
select is(
  (select stock from public.products where slug = 'test-d'), 5,
  '一部の商品の在庫が足りないときは、ほかの商品の在庫も減らさない'
);

-- 注文の取消は一度だけ効き、在庫は「押さえた数」だけ戻す（要確認の印には左右されない）
update public.orders set needs_attention = true where code = 'S-TEST04';
select is(
  (select public.cancel_order((select id from public.orders where code = 'S-TEST04'))), true,
  '支払い済みの注文を取り消せる'
);
select is(
  (select stock from public.products where slug = 'test-b'), 1,
  '要確認の印があっても、押さえた在庫は取消で戻す'
);
select is(
  (select public.cancel_order((select id from public.orders where code = 'S-TEST04'))), false,
  '同じ注文を二度取り消しても、二度目は何もしない'
);
select is(
  (select stock from public.products where slug = 'test-b'), 1,
  '二度取り消しても、在庫は一度しか戻らない'
);
select is(
  (select public.cancel_order((select id from public.orders where code = 'S-TEST06'))), true,
  '在庫を押さえられなかった注文も取り消せる'
);
select is(
  (select stock from public.products where slug = 'test-d'), 5,
  '在庫を押さえられなかった注文を取り消しても、在庫は増えない'
);

-- 海外発送は、一律の海外送料（ショップの設定）で確定する。国内の送料無料の金額は当てない
update public.shop_settings set overseas_shipping_fee = 5000;
select public.hold_order(
  '[{"product_id": "00000000-0000-4000-8000-000000000004", "quantity": 1}]'::jsonb,
  'en', 'S-TEST07', 'otok-g', 'ip-s6', p_overseas => true);
select results_eq(
  $$ select overseas, subtotal, shipping_fee, total from public.orders where code = 'S-TEST07' $$,
  $$ values (true, 1000, 5000, 6000) $$,
  '海外発送は一律の海外送料で確定し、海外の印を付ける'
);
update public.products set stock = stock + 10 where slug = 'test-d';
select public.hold_order(
  '[{"product_id": "00000000-0000-4000-8000-000000000004", "quantity": 11}]'::jsonb,
  'en', 'S-TEST08', 'otok-h', 'ip-s7', p_overseas => true);
select is(
  (select shipping_fee from public.orders where code = 'S-TEST08'), 5000,
  '海外発送には、国内の送料無料（1 万円以上）を当てない'
);

-- 予約の取消も一度だけ効く（二度押し・二人で同時に押してもメールと返金の記録は一度）
select is(
  (select public.cancel_booking((select id from public.bookings where code = 'R-TEST01'), 0, 0, 'admin')), true,
  '確定している予約を取り消せる'
);
select is(
  (select public.cancel_booking((select id from public.bookings where code = 'R-TEST01'), 0, 0, 'admin')), false,
  '同じ予約を二度取り消しても、二度目は何もしない'
);

-- ---------------------------------------------------------------------------
-- ブラウザの鍵（anon）からは読めない・呼べない
-- ---------------------------------------------------------------------------

set local role anon;
select is_empty($$ select id from public.bookings $$, 'anon key では予約（お客さまの連絡先）を読めない');
select throws_ok(
  $$ select public.release_booking('tok-j') $$,
  '42501', null,
  'anon key では予約の関数を呼べない'
);
reset role;

select * from finish();
rollback;
