# Koperasi Agro Mulyo Lestari

Website profil dan sistem manajemen anggota untuk Koperasi Agro Mulyo Lestari, Desa Giri Mulyo, Lampung Timur.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready PostgreSQL/Auth/Storage
- Prisma schema
- QR generation dan scanner kamera web app
- Excel import-ready dengan `exceljs`

## Jalan Lokal

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Mode lokal memakai data demo dari `src/lib/data.ts`, jadi halaman tetap bisa dicoba tanpa kredensial Supabase.
## Login

- Admin: memakai akun admin Supabase.
- Anggota: memakai NIK 16 digit + password.

Supabase Auth secara teknis tetap membutuhkan email/phone sebagai identifier internal. Untuk anggota, UI tetap hanya menampilkan NIK; route login nantinya mengubah NIK menjadi identifier internal memakai helper `memberNikToAuthEmail()` di `src/lib/auth-identifiers.ts`.

## Halaman Utama

- Publik: `/`, `/tentang`, `/struktur-pengurus`, `/produk-layanan`, `/berita`, `/galeri`, `/maps-unit`, `/kontak`, `/login`, `/signup`
- Admin: `/admin/dashboard`, `/admin/anggota`, `/admin/anggota/import`, `/admin/acara`, `/admin/laporan`, `/admin/audit-log`
- Anggota: `/anggota/dashboard`, `/anggota/profil`, `/anggota/acara`, `/anggota/riwayat-kehadiran`
- Presensi: `/presensi/scan`

Token QR demo:

```txt
rat-2026-aml-secure
```

## Supabase

1. Buat project Supabase.
2. Jalankan SQL di `supabase/schema.sql`.
3. Isi `.env` dari `.env.example`.
4. Buat akun admin lewat Supabase Auth.
5. Tambahkan row `profiles` dengan role `admin` untuk user tersebut.

Bucket storage yang disiapkan:

- `member-photos`
- `news-thumbnails`
- `board-photos`

Galeri publik tetap hardcoded di project untuk menekan biaya storage jangka panjang.

## Database

Prisma schema ada di:

```txt
prisma/schema.prisma
```

Generate client:

```bash
npm run prisma:generate
```

## Catatan Implementasi

- Presensi QR wajib divalidasi server-side.
- Timestamp disimpan UTC dan ditampilkan WIB.
- Soft delete dipakai untuk anggota dan acara.
- Riwayat presensi tidak ikut terhapus.
- Admin reset password anggota dilakukan manual.
- Login anggota memakai NIK, bukan email/no HP/no anggota.
- Import Excel perlu membaca highlight kuning memakai `exceljs`.
- Export CSV demo sudah tersedia dari halaman admin.

## Backup

Untuk produksi, aktifkan backup Supabase sesuai plan yang dipilih. Jika memakai plan tanpa backup lanjutan, lakukan export berkala:

- Export database PostgreSQL.
- Export file dari bucket storage.
- Simpan salinan di akun desa/koperasi, bukan akun pribadi mahasiswa KKN.

