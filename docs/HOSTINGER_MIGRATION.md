# Migrasi Produksi ke Hostinger MySQL

## Arsitektur Final

- App: Next.js di Hostinger Managed Node.js.
- Database: MySQL Hostinger via Prisma.
- Login: session lokal dengan cookie bertanda tangan (`AUTH_SECRET`).
- File upload: file fisik disimpan di storage hosting, MySQL hanya menyimpan path/metadata.

- Runtime rekomendasi: Node.js 20.x.
- Prisma memakai library engine bawaan agar tidak kena limit spawn proses di shared hosting.

Jangan simpan gambar sebagai blob di MySQL. Untuk kapasitas 50GB Hostinger, pola yang benar adalah:

```txt
/uploads/galeri/nama-file.jpg     -> file gambar di hosting
/gallery.image_url                -> path: /uploads/galeri/nama-file.jpg
```

## Environment Production

```env
NEXT_PUBLIC_SITE_URL=https://koperasi.domain.id
DATABASE_URL=mysql://USER:PASSWORD@HOST:3306/NAMA_DATABASE
AUTH_SECRET=isi-string-acak-panjang-minimal-32-karakter
```


## Urutan Migrasi

1. Buat database MySQL di hPanel Hostinger.
2. Masukkan env production di Hostinger Node.js app.
   - Preset framework: `Other` jika memakai output standalone.
   - Versi Node: `20.x`.
   - Build command: `npm run build`.
   - Output directory: `.next/standalone`.
   - Entry file: `server.js`.
3. Jalankan build:

```bash
npm install
npm run build
```

4. Buat tabel MySQL:

```bash
npx prisma db push
```

5. Pastikan akun admin produksi sudah tersedia dan dapat login.
6. Import anggota dari Excel desa jika data final belum masuk semua.
7. Uji fitur wajib: login admin, tambah anggota, import Excel, buat acara aktif, scan QR, export laporan.

## Subdomain

Rekomendasi:

```txt
koperasi.domain.id -> website koperasi
posyandu.domain.id -> website posyandu
```

Setiap website dibuat sebagai Node.js app/folder terpisah agar env dan database tidak bercampur.

## Catatan Nomor Anggota

Nomor anggota unik per tipe:

```txt
anggota_lama: 1, 2, 3, ...
anggota_baru: 1, 2, 3, ...
```

Di import Excel:

```txt
highlight kuning -> anggota_lama
tanpa highlight  -> anggota_baru
```
## Fallback phpMyAdmin

Jika SSH Hostinger gagal menjalankan `npx prisma db push` karena limit proses, buka phpMyAdmin lalu jalankan file SQL berikut pada database MySQL koperasi:

```txt
docs/hostinger-mysql-init.sql
```

Setelah SQL sukses, lanjutkan dengan login admin produksi dan import data final.
