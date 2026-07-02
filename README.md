# RentMotor — Aplikasi Rental Motor

Aplikasi web untuk sewa motor multi-cabang: booking online, promo/diskon, dan lacak GPS.
Dibangun dengan **Next.js** (frontend + backend ringan) dan **Supabase** (database + auth), lalu di-hosting gratis di **Vercel**.

Panduan ini ditulis untuk yang **belum pernah coding sama sekali**. Ikuti urutan dari atas ke bawah.

---

## Bagian 1 — Setup Database (Supabase)

1. Buka [supabase.com](https://supabase.com) → **Start your project** → daftar pakai email/GitHub (gratis).
2. Klik **New Project**. Isi:
   - Name: `rental-motor` (bebas)
   - Database Password: buat password, **simpan baik-baik**
   - Region: pilih `Southeast Asia (Singapore)` biar cepat
3. Tunggu ~2 menit sampai project selesai dibuat.
4. Di sidebar kiri, klik **SQL Editor** → **New query**.
5. Buka file `supabase/schema.sql` di folder project ini, **copy semua isinya**, paste ke SQL Editor, lalu klik **Run**.
   - Ini akan membuat semua tabel (motor, cabang, pesanan, promo, dll) dan mengisi 3 cabang contoh + 2 promo contoh.
6. Isi data motor contoh (opsional, bisa juga lewat halaman admin nanti setelah online). Di SQL Editor, jalankan:
   ```sql
   -- Ganti branch_id dengan id cabang asli (lihat di tabel branches > kolom id)
   select id, name from branches;
   ```
   Lalu insert motor, contoh:
   ```sql
   insert into motors (plate, name, brand, type, cc, price, branch_id, status)
   values ('D 1234 AB', 'Honda BeAT', 'Honda', 'Matic', 110, 75000, 'ISI_ID_CABANG_DI_SINI', 'tersedia');
   ```

### Ambil kunci API (untuk dihubungkan ke aplikasi)
1. Di sidebar, klik **Settings** (ikon gerigi) → **API**.
2. Catat 2 nilai ini:
   - **Project URL**
   - **anon public** key

### Buat akun admin (untuk login ke dashboard admin)
1. Sidebar → **Authentication** → **Users** → **Add user** → **Create new user**.
2. Isi email & password admin kamu, centang **Auto Confirm User**, klik **Create user**.
3. Kembali ke **SQL Editor**, jalankan (ganti email sesuai yang barusan dibuat):
   ```sql
   insert into admins (email) values ('email_admin_kamu@contoh.com');
   ```

---

## Bagian 2 — Jalankan di komputer sendiri (opsional, untuk coba dulu)

Perlu install [Node.js](https://nodejs.org) (pilih versi LTS) dulu jika belum ada.

1. Buka folder project ini lewat terminal/command prompt.
2. Copy file `.env.local.example` menjadi `.env.local`, lalu isi dengan Project URL & anon key dari Supabase.
3. Jalankan:
   ```bash
   npm install
   npm run dev
   ```
4. Buka `http://localhost:3000` di browser.

---

## Bagian 3 — Online-kan (Deploy ke Vercel)

1. Buat akun gratis di [vercel.com](https://vercel.com) (bisa langsung pakai akun GitHub).
2. Upload folder project ini ke **GitHub**:
   - Buat repository baru di [github.com](https://github.com/new)
   - Upload semua file project ini ke repo tersebut (lewat web GitHub: **Add file > Upload files**, atau minta bantuan lebih lanjut kalau mau pakai Git)
3. Di Vercel, klik **Add New > Project**, pilih repo GitHub yang barusan dibuat.
4. Sebelum klik Deploy, buka bagian **Environment Variables**, tambahkan:
   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project URL dari Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | anon public key dari Supabase |
5. Klik **Deploy**. Tunggu 1-2 menit.
6. Selesai — aplikasi kalian online di alamat seperti `rental-motor-xxxx.vercel.app`.

### Domain sendiri (opsional)
Beli domain (misal di Niagahoster/Domainesia/Namecheap), lalu di Vercel: **Project > Settings > Domains**, ikuti instruksi untuk menyambungkan.

---

## Bagian 4 — Menghubungkan GPS Tracker Fisik (saat siap)

Aplikasi ini sudah punya "pintu masuk" data GPS di `/api/gps/ingest`, tinggal dihubungkan ke hardware:

1. Beli GPS tracker motor (banyak dijual online, ~Rp150–400rb/unit + biaya SIM card data bulanan ~Rp20-50rb). Cari yang mendukung **webhook/HTTP POST** atau API — tanyakan ke penjual apakah datanya bisa diarahkan ke URL kustom.
2. Di Vercel, tambahkan 2 Environment Variable baru:
   - `SUPABASE_SERVICE_ROLE_KEY` — ambil dari Supabase **Settings > API > service_role key** (JAGA KERAHASIAANNYA, jangan taruh di kode/publik)
   - `GPS_INGEST_SECRET` — buat sendiri, kode rahasia acak (contoh: `rentmotor-secret-2026`)
3. Redeploy project di Vercel setelah menambah env var (klik **Redeploy**).
4. Di halaman admin (**Admin > Motor**), isi kolom **ID GPS Tracker** pada tiap motor sesuai ID device dari hardware.
5. Arahkan hardware/platform GPS untuk mengirim data ke:
   ```
   POST https://domain-kalian.vercel.app/api/gps/ingest
   Header: x-api-key: <isi GPS_INGEST_SECRET>
   Body JSON: { "gps_device_id": "TRK-0001", "lat": -6.914744, "lng": 107.609810, "speed_kmh": 32 }
   ```
6. Setelah data mulai masuk, halaman **Lacak Motor** & **Admin > Monitoring GPS** otomatis menampilkan posisi asli.

Sebelum GPS terpasang, halaman tracking tetap berfungsi dengan posisi contoh (placeholder) supaya tampilan bisa didemokan ke pelanggan/investor.

---

## Bagian 5 — Menambahkan Pembayaran Online (opsional, langkah lanjutan)

Untuk integrasi Midtrans/Xendit, disarankan minta bantuan developer/Claude lagi khusus untuk step ini karena butuh:
1. Daftar akun bisnis di Midtrans/Xendit (verifikasi 1-3 hari kerja)
2. Tambah API route baru untuk membuat transaksi & menerima notifikasi pembayaran (webhook)
3. Update status booking otomatis saat pembayaran berhasil

---

## Struktur Project

```
app/
  page.js              -> Katalog motor (pelanggan)
  booking/[motorId]/    -> Form booking + promo
  orders/               -> Riwayat pesanan
  tracking/             -> Lacak GPS motor
  admin/                -> Dashboard, CRUD motor/cabang/promo, kelola pesanan, monitoring GPS
  api/gps/ingest/        -> Endpoint penerima data hardware GPS tracker
lib/                    -> Koneksi Supabase & fungsi bantu
components/             -> Komponen UI yang dipakai berulang
supabase/schema.sql     -> Skema database, jalankan di Supabase SQL Editor
```

## Butuh bantuan lanjutan?
Kalau ada langkah yang error atau bingung, tinggal tanya lagi — sertakan pesan error/screenshot supaya bisa dibantu lebih tepat.
