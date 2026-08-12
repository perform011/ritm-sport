-- RITM SPORT / Supabase database schema
-- Run this whole file once in Supabase Dashboard -> SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.products (
  id text primary key,
  whop_product_id text unique,
  name text not null,
  brand text not null,
  category text not null,
  price numeric(12,2) not null check (price >= 0),
  old_price numeric(12,2) check (old_price is null or old_price >= price),
  image text not null,
  badge text,
  checkout_url text not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default (
    'RTM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 10))
  ),
  whop_payment_id text not null unique,
  whop_membership_id text,
  whop_product_id text,
  customer_email text not null,
  customer_name text,
  customer_phone text,
  shipping_address jsonb,
  custom_fields jsonb not null default '{}'::jsonb,
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'usd',
  status text not null default 'paid' check (
    status in ('paid', 'processing', 'shipped', 'delivered', 'refunded', 'cancelled')
  ),
  tracking_number text,
  expected_delivery date,
  notes text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists orders_customer_email_idx
  on public.orders (lower(customer_email));
create index if not exists orders_status_idx on public.orders (status);
create index if not exists products_whop_product_id_idx
  on public.products (whop_product_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

drop trigger if exists orders_set_updated_at on public.orders;
create trigger orders_set_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select to authenticated
using ((select auth.uid()) = id or public.is_admin());

drop policy if exists "profiles_update_own_name" on public.profiles;
create policy "profiles_update_own_name"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id and role = 'customer');

drop policy if exists "products_public_read_active" on public.products;
create policy "products_public_read_active"
on public.products for select to anon, authenticated
using (active = true);

drop policy if exists "products_admin_read_all" on public.products;
create policy "products_admin_read_all"
on public.products for select to authenticated
using (public.is_admin());

drop policy if exists "products_admin_insert" on public.products;
create policy "products_admin_insert"
on public.products for insert to authenticated
with check (public.is_admin());

drop policy if exists "products_admin_update" on public.products;
create policy "products_admin_update"
on public.products for update to authenticated
using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_admin_delete" on public.products;
create policy "products_admin_delete"
on public.products for delete to authenticated
using (public.is_admin());

drop policy if exists "orders_customer_or_admin_read" on public.orders;
create policy "orders_customer_or_admin_read"
on public.orders for select to authenticated
using (
  public.is_admin()
  or lower(customer_email) = lower(coalesce((select auth.jwt()) ->> 'email', ''))
);

drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update"
on public.orders for update to authenticated
using (public.is_admin()) with check (public.is_admin());

revoke all on public.profiles, public.products, public.orders from anon, authenticated;
grant select on public.products to anon, authenticated;
grant select on public.profiles, public.orders to authenticated;
grant update (full_name) on public.profiles to authenticated;
grant insert, update, delete on public.products to authenticated;
grant update (status, tracking_number, expected_delivery, notes) on public.orders to authenticated;

-- Edge Functions use the service_role key. RLS is bypassed for this role,
-- but PostgreSQL table privileges must still be granted explicitly.
grant usage on schema public to service_role;
grant select on public.products to service_role;
grant select, insert on public.orders to service_role;

insert into public.products
  (id, whop_product_id, name, brand, category, price, old_price, image, badge, checkout_url, sort_order)
values
  ('garmin-170', 'prod_1CCh397nRptrv', 'Ceas Garmin Forerunner 170 Music', 'GARMIN', 'Ceasuri & GPS', 389.76, 487.20, 'public/products/garmin-170.webp', '−20%', 'https://whop.com/ritm-sport/ceas-garmin-forerunner-170-music/', 1),
  ('hoka-skyward', 'prod_r4fQwbt5mvgpm', 'Pantofi alergare damă Hoka Skyward X 2', 'HOKA', 'Alergare', 262.53, 328.16, 'public/products/hoka-skyward.webp', '−20%', 'https://whop.com/ritm-sport/pantofi-alergare-dama-hoka-skyward-x-2/', 2),
  ('hoka-zinal', 'prod_hPmsQp2grjD3J', 'Pantofi alergare trail damă Hoka Zinal 3', 'HOKA', 'Alergare', 136.60, 181.92, 'public/products/hoka-zinal.webp', '−25%', 'https://whop.com/ritm-sport/pantofi-alergare-trail-dama-hoka-zinal-3/', 3),
  ('shokz-opendots', 'prod_QbL6d7T9agEPu', 'Căști audio Shokz OpenDots One', 'SHOKZ', 'Audio', 213.70, 229.85, 'public/products/shokz.webp', '−7%', 'https://whop.com/ritm-sport/casti-audio-shokz-opendots-one/', 4),
  ('oakley-sphaera', 'prod_buG8pwMBzaLk7', 'Ochelari Oakley Sphaera Strike Giro d''Italia 2026', 'OAKLEY', 'Ciclism', 207.93, 259.91, 'public/products/oakley-glasses.webp', '−20%', 'https://whop.com/ritm-sport/ochelari-oakley-sphaera-strike-giro-ditalia-2026/', 5),
  ('oakley-stelvio', 'prod_BQzv4jbL8xvGR', 'Cască ciclism Oakley Velo Stelvio MIPS', 'OAKLEY', 'Ciclism', 311.67, 366.67, 'public/products/oakley-helmet.webp', '−15%', 'https://whop.com/ritm-sport/casca-ciclism-oakley-velo-stelvio-mips/', 6),
  ('garmin-instinct', 'prod_LQsHDHMPkVyDQ', 'Ceas Garmin Instinct 3 Solar Tactical, 45 mm', 'GARMIN', 'Ceasuri & GPS', 446.41, 496.51, 'public/products/garmin-instinct.webp', '−10%', 'https://whop.com/ritm-sport/ceas-garmin-instinct-3-solar-tactical-45-mm/', 7),
  ('garmin-970', 'prod_RFwHh6wAXIRNq', 'Ceas Garmin Forerunner 970 AMOLED', 'GARMIN', 'Ceasuri & GPS', 740.52, 823.75, 'public/products/garmin-970.webp', '−10%', 'https://whop.com/ritm-sport/ceas-garmin-forerunner-970-amoled/', 8),
  ('mizuno-alpha', 'prod_ylA4pAm5bKF3H', 'Ghete fotbal Mizuno Alpha III Elite Mix SS 2026', 'MIZUNO', 'Fotbal', 153.38, 255.56, 'public/products/mizuno-alpha.webp', '−40%', 'https://whop.com/ritm-sport/ghete-fotbal-mizuno-alpha-iii-elite-mix-ss-2026/', 9),
  ('asics-kayano', 'prod_mlNsmUaHLcL7J', 'Pantofi alergare damă Asics Gel-Kayano 32 Sunny Sizzle', 'ASICS', 'Alergare', 155.56, 222.22, 'public/products/asics-kayano.webp', '−30%', 'https://whop.com/ritm-sport/pantofi-alergare-dama-asics-gel-kayano-32-sunny-sizzle/', 10),
  ('oakley-jersey', 'prod_IF8sR3Ox51Olt', 'Bluză ciclism bărbați Oakley Icon Training', 'OAKLEY', 'Ciclism', 116.78, 145.98, 'public/products/oakley-jersey.webp', '−20%', 'https://whop.com/ritm-sport/oakley-icon-training/', 11),
  ('on-cloudmonster', 'prod_T5jX3qfQYefJT', 'Pantofi alergare damă ON Cloudmonster 3', 'ON', 'Alergare', 166.67, 222.22, 'public/products/on-cloudmonster.webp', '−25%', 'https://whop.com/ritm-sport/pantofi-alergare-dama-on-cloudmonster-3/', 12),
  ('adidas-supernova', 'prod_Jo09lNnrH3O73', 'Pantofi alergare bărbați Adidas Supernova Rise 3', 'ADIDAS', 'Alergare', 124.18, 163.40, 'public/products/adidas-supernova.webp', '−24%', 'https://whop.com/ritm-sport/pantofi-alergare-barbati-adidas-supernova-rise-3/', 13),
  ('puma-deviate', 'prod_PRWlhBiGbOLqA', 'Pantofi Puma Deviate Nitro Elite 4 Showtime', 'PUMA', 'Alergare', 190.63, 272.11, 'public/products/puma-deviate.webp', '−30%', 'https://whop.com/ritm-sport/pantofi-puma-deviate-nitro-elite-4-showtime/', 14),
  ('urban-flex', 'prod_z3D5YNsUwXaVg', 'Pantofi sport Urban Flex negru-lime', 'RITM', 'Alergare', 24.90, null, 'public/products/urban-flex.webp', 'NOU', 'https://whop.com/ritm-sport/pantofi-sport-urban-flex-negru-lime/', 15),
  ('aero-run', 'prod_LH0dNZZQhlTKj', 'Pantofi alergare Aero Run gri-albastru', 'RITM', 'Alergare', 27.90, null, 'public/products/aero-run.webp', 'NOU', 'https://whop.com/ritm-sport/pantofi-alergare-aero-run-gri-albastru/', 16),
  ('street-color', 'prod_A6locSHzXdDva', 'Pantofi sport Street Color bej-coral', 'RITM', 'Alergare', 29.90, null, 'public/products/street-color.webp', 'NOU', 'https://whop.com/ritm-sport/pantofi-sport-street-color-bej-coral/', 17)
on conflict (id) do update set
  whop_product_id = excluded.whop_product_id,
  name = excluded.name,
  brand = excluded.brand,
  category = excluded.category,
  price = excluded.price,
  old_price = excluded.old_price,
  image = excluded.image,
  badge = excluded.badge,
  checkout_url = excluded.checkout_url,
  sort_order = excluded.sort_order;

-- After you create your own account on the site, run this separately and
-- replace the email. Never expose service_role credentials in browser code.
-- update public.profiles
-- set role = 'admin'
-- where id = (select id from auth.users where email = 'YOUR_ADMIN_EMAIL');
