# Panduan Operator Website Koperasi AML

Dokumen ini dipakai oleh admin/operator Koperasi Agro Mulyo Lestari untuk mengelola data anggota, acara, presensi QR, galeri, dan laporan.

## 1. Login Admin

1. Buka halaman login website.
2. Pilih tab `Admin`.
3. Masukkan email dan password admin.
4. Setelah masuk, admin akan diarahkan ke dashboard.

Catatan keamanan:

- Jangan membagikan password admin ke anggota.
- Jika password admin diganti, catat di tempat aman milik koperasi/desa.
- Logout setelah selesai menggunakan komputer bersama.

## 2. Import Data Anggota

1. Masuk ke `Admin > Anggota`.
2. Pilih menu `Import`.
3. Upload file Excel data anggota dari desa.
4. Periksa preview data sebelum disimpan.
5. Klik import jika data sudah benar.

Ketentuan penting:

- NIK wajib 16 digit karena dipakai untuk login anggota.
- Password awal anggota adalah NIK.
- Anggota wajib mengganti password saat login pertama.
- Baris highlight kuning dibaca sebagai `anggota lama`.
- Baris tanpa highlight dibaca sebagai `anggota baru`.
- Nomor anggota lama dan baru dipisah, jadi masing-masing boleh mulai dari 1.

## 3. Tambah Dan Kelola Anggota

Menu: `Admin > Anggota`

Admin dapat:

- melihat daftar anggota
- mencari anggota
- melihat detail anggota
- mengedit data anggota
- reset password anggota ke NIK
- menonaktifkan anggota

Gunakan tombol `Detail` untuk membuka data lengkap anggota.

## 4. Login Anggota

1. Buka halaman login.
2. Pilih tab `Anggota`.
3. Masukkan NIK dan password.
4. Jika pertama kali login, anggota wajib mengganti password.
5. Setelah password berhasil diganti, anggota masuk ke dashboard.

Anggota dapat:

- melihat dashboard
- melihat acara
- scan QR presensi
- melihat riwayat kehadiran
- mengedit profil
- mengganti/upload foto profil

## 5. Foto Profil Anggota

Menu anggota: `Profil Saya`

Langkah:

1. Klik `Pilih Foto`.
2. Atur crop foto pada modal.
3. Geser foto dan atur zoom sampai wajah terlihat rapi.
4. Klik `Gunakan Foto`.
5. Klik `Simpan Foto`.

Catatan:

- Format yang didukung: JPG, PNG, WEBP.
- Foto otomatis dikompres dan disimpan sebagai WEBP.
- Jika anggota tersebut ada di struktur pengurus, foto struktur ikut diperbarui.
- Jika file foto struktur hilang dari storage, sistem akan menampilkan icon orang sebagai fallback.

## 6. Membuat Acara QR

Menu: `Admin > Acara`

Langkah:

1. Klik tambah acara.
2. Isi judul, tanggal, jam, lokasi, dan deskripsi.
3. Simpan acara.
4. Aktifkan acara jika sudah siap dipakai presensi.
5. Buka halaman QR acara.
6. Tampilkan QR kepada anggota/tamu.

Catatan:

- Hanya acara aktif yang bisa dipakai untuk presensi QR.
- Setelah acara selesai, ubah status acara agar data lebih rapi.

## 7. Presensi Anggota

1. Anggota login.
2. Masuk ke menu scan QR atau buka link scan.
3. Izinkan akses kamera.
4. Arahkan kamera ke QR acara.
5. Jika berhasil, sistem mencatat kehadiran.

Jika kamera tidak aktif:

- pastikan browser diberi izin kamera
- coba refresh halaman
- gunakan browser Chrome/Edge versi terbaru

## 8. Presensi Tamu

1. Buka halaman login.
2. Pilih tab `Tamu`.
3. Isi nama dan asal/instansi.
4. Scan QR acara.
5. Setelah berhasil, tamu cukup klik `Selesai`.

Catatan:

- Data tamu berlaku 7 hari.
- Data tamu lama otomatis dibersihkan oleh sistem saat validasi presensi berjalan.
- Identitas tamu hanya memakai nama dan asal/instansi agar cepat diisi.

## 9. Rekap Presensi

Menu: `Admin > Acara > Detail Acara > Presensi`

Admin dapat melihat:

- anggota hadir
- anggota tidak hadir
- tamu hadir
- waktu presensi
- metode presensi

Gunakan fitur export Excel jika perlu laporan.

## 10. Export Excel

Menu yang menyediakan export:

- daftar anggota
- rekap presensi acara
- laporan admin

File export menggunakan format `.xlsx` agar mudah dibuka di Microsoft Excel.

## 11. Galeri

Menu admin: `Admin > Galeri`

Admin dapat:

- upload foto kegiatan
- mengisi judul, kategori, tanggal, dan deskripsi
- menghapus foto yang diupload

Catatan:

- Foto awal bawaan website tidak bisa dihapus dari menu admin.
- Foto upload disimpan di storage hosting.
- Foto otomatis dikompres ke WEBP.

## 12. Pengaturan Website

Menu: `Admin > Pengaturan`

Admin dapat mengubah:

- nama koperasi
- desa
- kecamatan
- kabupaten
- alamat
- WhatsApp admin
- email
- jam operasional

Di halaman ini juga tersedia fitur reset password admin.

## 13. Reset Password Admin

Menu: `Admin > Pengaturan > Reset Password Admin`

Langkah:

1. Masukkan password admin baru.
2. Masukkan konfirmasi password.
3. Klik `Reset Password Admin`.
4. Jika berhasil, sistem menampilkan notifikasi.

Setelah diganti, gunakan password baru untuk login berikutnya.

## 14. Pembersihan Data Demo

File SQL:

```txt
scripts/cleanup-production-data.sql
```

Gunakan file ini hanya saat ingin mengosongkan data operasional/demo sebelum website dipakai produksi.

Data yang dihapus:

- presensi anggota
- presensi tamu
- data tamu
- audit log
- acara
- anggota
- akun login anggota
- pengumuman
- galeri database
- posts

Data yang tidak dihapus:

- akun admin
- pengaturan website
- struktur pengurus
- produk/layanan
- unit koperasi

Selalu export/backup database sebelum menjalankan SQL pembersihan.

## 15. Pembersihan File Storage

SQL pembersihan hanya menghapus data MySQL, bukan file fisik di storage hosting.

Folder yang perlu dicek di Hostinger File Manager atau SSH:

```txt
storage/gallery
storage/profile-photos
storage/site-assets
```

Yang boleh dibersihkan:

- isi `storage/gallery` jika semua foto galeri upload demo sudah dihapus dari database
- isi `storage/profile-photos` jika semua foto profil demo sudah tidak dipakai

Yang jangan dihapus sembarangan:

- `storage/site-assets`, karena berisi gambar bawaan website seperti logo, hero, produk, dan galeri awal

## 16. Backup Rutin

Minimal lakukan backup:

- sebelum import data anggota besar
- sebelum menjalankan SQL pembersihan
- sebelum mengganti domain utama
- setelah website dinyatakan final

Yang perlu dibackup:

- database MySQL dari phpMyAdmin/hPanel
- folder upload galeri
- folder foto profil anggota
- folder aset website

Simpan backup di akun resmi koperasi/desa, bukan hanya di laptop pribadi.

## 17. Checklist Tes Setelah Deploy

Setelah deploy selesai, cek:

- halaman utama bisa dibuka
- login admin berhasil
- login anggota berhasil
- anggota wajib ganti password pertama kali
- upload foto profil anggota berhasil
- import anggota berhasil
- buat acara aktif berhasil
- scan QR anggota berhasil
- scan QR tamu berhasil
- rekap presensi tampil
- export Excel bisa dibuka
- upload dan hapus galeri berhasil
- logout kembali ke halaman login/domain yang benar

