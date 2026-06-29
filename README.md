# Koperasi Agro Mulyo Lestari

Website profil dan sistem manajemen anggota untuk Koperasi Agro Mulyo Lestari, Desa Giri Mulyo, Lampung Timur.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase PostgreSQL/Auth
- Prisma schema
- QR generation dan scanner kamera web app
- Import/export Excel dengan `exceljs`

## Jalan Lokal

```bash
npm install
npm run dev
```

Buka:

```txt
http://localhost:3000
```

Portal admin dan anggota membutuhkan konfigurasi Supabase di `.env.local`.

## Login

- Admin: memakai akun admin Supabase.
- Anggota: memakai NIK 16 digit + password.

Supabase Auth secara teknis tetap membutuhkan email/phone sebagai identifier internal. Untuk anggota, UI tetap hanya menampilkan NIK; route login mengubah NIK menjadi identifier internal memakai helper `memberNikToAuthEmail()` di `src/lib/auth-identifiers.ts`.

## Halaman Utama

- Publik: `/`, `/unit`, `/struktur`, `/pengumuman`, `/login`, `/signup`
- Admin: `/admin/dashboard`, `/admin/anggota`, `/admin/anggota/import`, `/admin/acara`, `/admin/laporan`, `/admin/audit-log`, `/admin/pengaturan`
- Anggota: `/anggota/dashboard`, `/anggota/profil`, `/anggota/acara`, `/anggota/riwayat-kehadiran`
- Presensi: `/presensi/scan`

## Supabase

1. Buat project Supabase.
2. Jalankan SQL di `supabase/schema.sql`.
3. Isi `.env.local` dari konfigurasi Supabase.
4. Buat akun admin lewat Supabase Auth.
5. Tambahkan row `profiles` dengan role `admin` untuk user tersebut.

Jika database lama sudah pernah memakai `member_number unique`, jalankan migration di `supabase/migrations/20260629_member_number_per_type.sql` agar nomor anggota bisa dimulai dari 1 untuk anggota lama dan anggota baru secara terpisah.

## Database

Prisma schema ada di:

```txt
prisma/schema.prisma
```

Generate client:

```bash
npm run prisma:generate
```

## Import Anggota

Format Excel desa yang didukung:

```txt
No | Nama Anggota | No Anggota | NIK | Tempat Lahir | Tanggal Lahir | Alamat | No HP
```

Kolom `Email` dan `Tipe/Jenis Anggota` boleh ditambahkan. Jika tipe tidak ada, sistem mencoba membaca sheet bantu dengan heading `nama anggota baru` atau `nama pendiri`. NIK tetap wajib 16 digit karena login anggota memakai NIK.

## Catatan Implementasi

- Presensi QR wajib divalidasi server-side.
- Timestamp disimpan UTC dan ditampilkan WIB.
- Soft delete dipakai untuk anggota dan acara.
- Riwayat presensi tidak ikut terhapus.
- Admin reset password anggota dilakukan manual.
- Nomor anggota unik per tipe anggota, bukan global.
- Export data admin menggunakan Excel `.xlsx`.

## Backup

Untuk produksi, aktifkan backup Supabase sesuai plan yang dipilih. Jika memakai plan tanpa backup lanjutan, lakukan export berkala:

- Export database PostgreSQL.
- Export file dari storage yang dipakai.
- Simpan salinan di akun desa/koperasi, bukan akun pribadi mahasiswa KKN.