-- ショップの商品写真。誰でも見られる（商品ページに出す）が、上げる・消すのはサーバー（service role）だけ。
-- storage.objects には anon / authenticated 向けのポリシーを置かないので、ブラウザからは書き込めない
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('shop-images', 'shop-images', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do nothing;
