-- ============================================================
-- SKEMA DATABASE RENTAL MOTOR
-- Jalankan file ini di: Supabase Dashboard > SQL Editor > New query > Run
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- CABANG ----------
create table if not exists branches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  address text,
  phone text,
  hours text default '08:00 - 20:00',
  geofence int default 120, -- radius zona aman motor (meter)
  lat double precision,
  lng double precision,
  created_at timestamptz default now()
);

-- ---------- MOTOR ----------
create table if not exists motors (
  id uuid primary key default gen_random_uuid(),
  plate text not null,
  name text not null,
  brand text,
  type text default 'Matic', -- Matic | Sport | Bebek
  cc int,
  price numeric not null,
  branch_id uuid references branches(id) on delete cascade,
  status text default 'tersedia', -- tersedia | disewa | servis
  gps_device_id text, -- ID perangkat GPS tracker fisik (isi saat sudah pasang hardware)
  photo_url text,
  created_at timestamptz default now()
);

-- ---------- PROMO / VOUCHER ----------
create table if not exists promos (
  code text primary key,
  type text not null default 'percent', -- percent | fixed
  value numeric not null,
  min_days int default 1,
  expiry date,
  quota int default 0,
  used int default 0,
  branch_id uuid references branches(id), -- null = berlaku semua cabang
  created_at timestamptz default now()
);

-- ---------- PESANAN ----------
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  motor_id uuid references motors(id),
  branch_id uuid references branches(id),
  customer_name text not null,
  phone text not null,
  email text not null,
  start_date date not null,
  end_date date not null,
  days int not null,
  price_per_day numeric not null,
  subtotal numeric not null,
  discount numeric default 0,
  total numeric not null,
  promo_code text references promos(code),
  status text default 'pending', -- pending | dikonfirmasi | aktif | selesai | dibatalkan
  created_at timestamptz default now()
);

-- ---------- LOG POSISI GPS (diisi oleh hardware tracker via API) ----------
create table if not exists gps_positions (
  id bigint generated always as identity primary key,
  motor_id uuid references motors(id) on delete cascade,
  lat double precision not null,
  lng double precision not null,
  speed_kmh numeric,
  recorded_at timestamptz default now()
);
create index if not exists idx_gps_motor_time on gps_positions (motor_id, recorded_at desc);

-- ---------- DAFTAR EMAIL ADMIN YANG DIIZINKAN ----------
create table if not exists admins (
  email text primary key
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
alter table branches enable row level security;
alter table motors enable row level security;
alter table promos enable row level security;
alter table bookings enable row level security;
alter table gps_positions enable row level security;
alter table admins enable row level security;

-- Semua orang boleh membaca data cabang, motor, promo (untuk tampilan katalog)
create policy "public read branches" on branches for select using (true);
create policy "public read motors" on motors for select using (true);
create policy "public read promos" on promos for select using (true);
create policy "public read gps" on gps_positions for select using (true);

-- Siapapun boleh membuat pesanan baru (booking), tapi tidak bisa mengubah punya orang lain
create policy "public insert bookings" on bookings for insert with check (true);
create policy "public read bookings" on bookings for select using (true);

-- Hanya admin (email terdaftar di tabel admins) yang boleh ubah/hapus data master
create policy "admin write branches" on branches for all using (
  auth.jwt() ->> 'email' in (select email from admins)
) with check (
  auth.jwt() ->> 'email' in (select email from admins)
);
create policy "admin write motors" on motors for all using (
  auth.jwt() ->> 'email' in (select email from admins)
) with check (
  auth.jwt() ->> 'email' in (select email from admins)
);
create policy "admin write promos" on promos for all using (
  auth.jwt() ->> 'email' in (select email from admins)
) with check (
  auth.jwt() ->> 'email' in (select email from admins)
);
create policy "admin update bookings" on bookings for update using (
  auth.jwt() ->> 'email' in (select email from admins)
);
create policy "admin delete bookings" on bookings for delete using (
  auth.jwt() ->> 'email' in (select email from admins)
);

-- ============================================================
-- DATA CONTOH (boleh dihapus/diedit nanti dari halaman admin)
-- ============================================================
insert into branches (name, city, address, phone, hours, geofence) values
  ('Cabang Bandung', 'Bandung', 'Jl. Dago No. 45', '0812-1111-2222', '08:00 - 20:00', 130),
  ('Cabang Bali', 'Denpasar', 'Jl. Sunset Road No. 88', '0813-3333-4444', '07:00 - 21:00', 150),
  ('Cabang Yogyakarta', 'Yogyakarta', 'Jl. Malioboro No. 12', '0821-5555-6666', '08:00 - 19:00', 110)
on conflict do nothing;

insert into promos (code, type, value, min_days, expiry, quota, used, branch_id) values
  ('LIBURAN10', 'percent', 10, 2, '2026-08-31', 50, 0, null),
  ('HEMAT25K', 'fixed', 25000, 3, '2026-07-31', 20, 0, null)
on conflict do nothing;

-- Setelah tabel branches terisi, tambahkan motor contoh (jalankan terpisah setelah cek id cabang)
-- Lihat README.md bagian "Isi data awal" untuk contoh query motor.
