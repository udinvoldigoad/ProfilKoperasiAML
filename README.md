# Koperasi Agro Mulyo Lestari

Website profil dan sistem manajemen anggota untuk Koperasi Agro Mulyo Lestari, Desa Giri Mulyo, Lampung Timur.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Hostinger Managed Node.js
- MySQL via Prisma
- Session login lokal dengan cookie bertanda tangan
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

Portal admin dan anggota membutuhkan `DATABASE_URL` MySQL di `.env.local`.

## Login

- Admin: email + password yang sudah dibuat di database produksi.
- Anggota: NIK 16 digit + password.
- Password awal anggota = NIK dan anggota wajib mengganti password saat login pertama.

## Halaman Utama

- Publik: `/`, `/unit`, `/struktur`, `/pengumuman`, `/login`, `/signup`
- Admin: `/admin/dashboard`, `/admin/anggota`, `/admin/anggota/import`, `/admin/acara`, `/admin/laporan`, `/admin/audit-log`, `/admin/pengaturan`
- Anggota: `/anggota/dashboard`, `/anggota/profil`, `/anggota/acara`, `/anggota/riwayat-kehadiran`
- Presensi: `/presensi/scan`

## Hostinger MySQL

1. Buat database MySQL di hPanel Hostinger.
2. Isi `.env.local` atau env production:

```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:3306/NAMA_DATABASE"
AUTH_SECRET="isi-string-acak-panjang"
```

3. Generate Prisma client:

```bash
npm run prisma:generate
```

4. Buat tabel dari schema Prisma:

```bash
npx prisma db push
```

5. Pastikan admin produksi sudah tersedia dan login bisa dilakukan sebelum membuka akses pengguna.

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

Kolom `Email` dan `Tipe/Jenis Anggota` boleh ditambahkan. Jika tipe tidak ada, sistem membaca warna baris: highlight kuning = anggota lama, tanpa highlight = anggota baru. NIK tetap wajib 16 digit karena login anggota memakai NIK.

## Catatan Implementasi

- Presensi QR wajib divalidasi server-side.
- Timestamp disimpan UTC dan ditampilkan WIB.
- Soft delete dipakai untuk anggota dan acara.
- Riwayat presensi tidak ikut terhapus.
- Admin reset password anggota mengembalikan password ke NIK.
- Nomor anggota unik per tipe anggota, bukan global.
- Export data admin menggunakan Excel `.xlsx`.
- File upload produksi sebaiknya disimpan di storage/folder hosting, sedangkan MySQL hanya menyimpan path file.

## Backup

Untuk produksi di Hostinger, lakukan backup berkala:

- Export database MySQL dari hPanel/phpMyAdmin.
- Backup folder upload dari file manager/FTP.
- Simpan salinan di akun desa/koperasi, bukan akun pribadi mahasiswa KKN.