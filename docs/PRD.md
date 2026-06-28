# Product Requirements Document (PRD)

## Profil dan Sistem Manajemen Koperasi Agro Mulyo Lestari

Versi: 1.0  
Tanggal: 28 Juni 2026  
Status: Demo production  
URL Demo: https://profil-koperasi-demo.vercel.app

---

## 1. Ringkasan Produk

Profil dan Sistem Manajemen Koperasi Agro Mulyo Lestari adalah aplikasi web untuk memperkenalkan profil koperasi kepada masyarakat sekaligus membantu pengurus mengelola data anggota, acara, presensi QR, pengumuman, laporan, dan unit usaha koperasi.

Produk ini dibuat untuk kebutuhan presentasi dan demo operasional di Desa Giri Mulyo, Kecamatan Marga Sekampung, Kabupaten Lampung Timur. Sistem berjalan dalam mode demo tanpa wajib terhubung ke Supabase, tetapi sudah disiapkan agar dapat dipakai dengan Supabase untuk kebutuhan produksi.

## 2. Latar Belakang

Koperasi Agro Mulyo Lestari membutuhkan media digital yang mampu:

- Menampilkan profil koperasi secara rapi dan mudah dipahami warga.
- Menunjukkan unit usaha koperasi seperti Saprotan, Gudang Distribusi Alpukat, dan Pengumpulan Bibit/Sekretariat Koperasi AML.
- Membantu admin mengelola anggota, acara, presensi, laporan, dan pengumuman.
- Memudahkan anggota melihat profil, acara, dan riwayat kehadiran.
- Mendemokan alur presensi QR untuk acara aktif tanpa harus menyimpan data pada mode demo.

## 3. Tujuan Produk

Tujuan utama:

- Menjadi website profil resmi koperasi yang informatif dan mudah dipresentasikan ke warga.
- Menjadi prototipe sistem operasional koperasi untuk manajemen anggota dan presensi kegiatan.
- Menyediakan demo yang bisa digunakan tanpa konfigurasi database produksi.
- Menjadi fondasi teknis yang siap dikembangkan ke sistem produksi berbasis Supabase.

Tujuan pendukung:

- Mengurangi pencatatan manual anggota dan kehadiran.
- Memudahkan pengurus membuat rekap presensi dan laporan.
- Menampilkan lokasi unit usaha koperasi secara interaktif melalui peta.
- Menyediakan tampilan publik yang nyaman di desktop dan mobile.

## 4. Target Pengguna

### 4.1 Warga atau Calon Anggota

Kebutuhan:

- Mengenal koperasi dan unit usaha yang tersedia.
- Melihat struktur kepengurusan, pengumuman, galeri, dan peta unit.
- Mendaftar atau diarahkan ke proses pendaftaran anggota.

### 4.2 Anggota Koperasi

Kebutuhan:

- Login menggunakan NIK dan password.
- Melihat dashboard anggota.
- Melihat dan memperbarui profil pribadi.
- Melihat daftar acara koperasi.
- Melihat riwayat kehadiran.
- Melakukan presensi melalui scan QR saat acara aktif.

### 4.3 Admin atau Pengurus Koperasi

Kebutuhan:

- Mengelola data anggota.
- Import anggota dari Excel.
- Mengelola acara dan QR presensi.
- Melihat rekap hadir dan tidak hadir.
- Export laporan ke Excel/PDF.
- Mengelola pengumuman.
- Melihat audit log aktivitas admin.
- Mengatur profil koperasi.

### 4.4 Tim Pengembang atau Pengelola Sistem

Kebutuhan:

- Menjalankan aplikasi secara lokal.
- Mengaktifkan integrasi Supabase ketika masuk produksi.
- Memelihara data hardcoded untuk demo.
- Melakukan deploy ke Vercel.

## 5. Ruang Lingkup Produk

### 5.1 Termasuk Dalam Scope

- Website publik profil koperasi.
- One-scroll landing page berisi profil, produk/layanan, unit, galeri, struktur, dan pengumuman.
- Halaman unit koperasi dengan peta Leaflet/OpenStreetMap.
- Modal detail unit dengan tombol Google Maps.
- Portal admin.
- Portal anggota.
- Login dan logout.
- Manajemen anggota.
- Import anggota Excel.
- Export laporan Excel.
- Laporan ringkas PDF.
- Manajemen acara.
- QR presensi dan scanner QR.
- Rekap hadir dan tidak hadir.
- Audit log admin.
- Tema terang/gelap untuk dashboard admin dan anggota.
- Mode demo dengan data lokal.
- Kesiapan integrasi Supabase.

### 5.2 Tidak Termasuk Dalam Scope Saat Ini

- Payment atau simpan pinjam koperasi.
- Akuntansi lengkap koperasi.
- Inventory stok barang Saprotan.
- Marketplace produk.
- Notifikasi WhatsApp otomatis.
- Role permission granular di luar admin dan anggota.
- Aplikasi mobile native Android/iOS.
- Editing galeri dari dashboard admin, karena galeri saat ini hardcoded.

## 6. Platform dan Teknologi

Stack utama:

- Next.js App Router.
- React.
- TypeScript.
- Tailwind CSS.
- Supabase-ready Auth, PostgreSQL, dan Storage.
- Prisma schema sebagai referensi model database.
- Leaflet dan OpenStreetMap untuk peta interaktif.
- html5-qrcode untuk scanner QR.
- qrcode untuk generate QR.
- exceljs untuk import/export Excel.
- jsPDF dan jspdf-autotable untuk PDF.
- Vercel untuk deployment demo.

## 7. Alur Pengguna Utama

### 7.1 Alur Warga Melihat Profil Koperasi

1. Warga membuka halaman utama.
2. Warga melihat hero profil koperasi.
3. Warga scroll ke produk/layanan.
4. Warga membuka bagian unit koperasi.
5. Warga melihat peta dan card ringkas unit.
6. Warga menekan tombol Lihat Detail pada unit.
7. Sistem membuka modal detail unit.
8. Warga dapat membuka lokasi di Google Maps.

### 7.2 Alur Admin Mengelola Anggota

1. Admin login.
2. Admin masuk dashboard.
3. Admin membuka menu Anggota.
4. Admin melihat tabel anggota dengan filter dan pagination.
5. Admin dapat melihat detail anggota.
6. Admin dapat menambah, edit, reset password, atau menonaktifkan anggota.
7. Admin dapat export data anggota ke Excel.

### 7.3 Alur Admin Mengelola Acara dan Presensi

1. Admin membuka menu Acara.
2. Admin membuat acara baru.
3. Sistem membuat token QR untuk acara.
4. Admin membuka halaman QR acara.
5. Anggota melakukan scan QR saat acara aktif.
6. Admin membuka rekap presensi.
7. Sistem menampilkan daftar hadir dan daftar tidak hadir.
8. Admin export rekap presensi ke Excel.

### 7.4 Alur Anggota Melakukan Presensi

1. Anggota login.
2. Anggota membuka dashboard atau menu acara.
3. Anggota membuka scanner QR.
4. Anggota memindai QR acara aktif.
5. Sistem memvalidasi token QR di server.
6. Sistem mencatat kehadiran jika valid.
7. Anggota melihat riwayat kehadiran.

## 8. Fitur Publik

### 8.1 Landing Page One-scroll

Deskripsi:

Halaman utama menampilkan seluruh informasi utama koperasi dalam satu alur scroll.

Konten:

- Hero profil koperasi.
- Tentang koperasi.
- Produk dan layanan.
- Unit koperasi.
- Galeri.
- Struktur kepengurusan.
- Pengumuman.

Kriteria penerimaan:

- Navigasi publik mengarah ke section halaman utama.
- Tampilan mobile dan desktop responsif.
- Tidak ada tombol login di footer publik.
- Informasi inti koperasi dapat dipahami tanpa login.

### 8.2 Produk dan Layanan

Produk yang ditampilkan:

- Sarana Produksi Pertanian.
- Jual Beli Bibit Pertanian.
- Gudang Distribusi Pertanian Alpukat.

Kriteria penerimaan:

- Setiap produk memiliki judul, kategori, deskripsi, dan gambar relevan.
- Gambar tidak lagi memakai placeholder generik.

### 8.3 Galeri Publik

Deskripsi:

Galeri menampilkan 6 foto dokumentasi Desa Giri Mulyo/Koperasi.

Kriteria penerimaan:

- Desktop menggunakan carousel horizontal dengan tombol panah.
- Mobile tetap rapi dan hemat ruang.
- Panah hilang ketika posisi scroll sudah mentok kiri atau kanan.
- Tidak memakai scrollbar visual di desktop.

### 8.4 Struktur Kepengurusan

Deskripsi:

Menampilkan struktur pengurus dan pengawas koperasi dalam bentuk bagan.

Kriteria penerimaan:

- Struktur tampil rapi seperti bagan organisasi.
- Avatar default memakai ikon orang, bukan inisial.
- Halaman `/struktur` dan section homepage menggunakan komponen yang konsisten.

### 8.5 Unit Koperasi dan Peta

Unit yang ditampilkan:

- Toko Pertanian/Saprotan.
- Gudang Distribusi Alpukat.
- Pengumpulan Bibit/Sekretariat Koperasi AML.

Deskripsi:

Section unit menampilkan peta interaktif dan card ringkas unit. Detail lengkap dibuka lewat modal.

Informasi ringkas card:

- Judul unit.
- Jenis unit.
- Penanggung jawab dengan ikon orang.
- Nomor telepon dengan ikon telepon.
- Jam operasional dengan ikon jam.
- Lokasi dengan ikon lokasi.
- Tombol Lihat Detail.

Informasi detail modal:

- Unit.
- Alamat.
- Jarak dari Balai Desa.
- Radius jika ada.
- Tempat jika ada.
- Pengiriman jika ada.
- Penanggung jawab.
- Jam operasional.
- No HP.
- Koordinat.
- Tombol Lihat di Google Maps.

Kriteria penerimaan:

- Peta menggunakan Leaflet/OpenStreetMap, bukan satelit.
- Marker utama unit jelas.
- Marker patokan Balai Desa lebih kecil/abu-abu.
- Tidak ada garis antar titik.
- Tombol Google Maps tersedia di modal dan popup peta.
- Card unit tidak terlalu panjang karena detail dipindah ke modal.

### 8.6 Pengumuman Publik

Deskripsi:

Menampilkan pengumuman koperasi yang dipublikasikan.

Kriteria penerimaan:

- Pengumuman tampil di halaman utama.
- Pengumuman yang pinned mendapat prioritas visual.

## 9. Fitur Admin

### 9.1 Dashboard Admin

Deskripsi:

Dashboard admin menampilkan ringkasan statistik, grafik kehadiran, acara terdekat, dan anggota terbaru.

Komponen:

- Total anggota.
- Anggota aktif.
- Acara aktif.
- Presensi bulan ini.
- Grafik Kehadiran per Acara.
- Acara terdekat.
- Anggota terbaru.

Kriteria penerimaan:

- Grafik Kehadiran per Acara menampilkan 3 acara per halaman.
- Ukuran box grafik tetap stabil/simetris ketika pagination berpindah.
- Anggota terbaru maksimal 10 anggota per halaman.
- Aksi cepat lama diganti grafik kehadiran.

### 9.2 Manajemen Anggota

Deskripsi:

Admin dapat mengelola data anggota koperasi.

Fitur:

- Tabel daftar anggota.
- Search anggota.
- Filter status dan tipe anggota.
- Detail anggota.
- Tambah anggota.
- Edit anggota.
- Reset password.
- Nonaktifkan anggota.
- Import anggota dari Excel.
- Export anggota ke Excel.

Kriteria penerimaan:

- Tombol Detail di tabel terlihat jelas sebagai aksi klik.
- Di halaman detail anggota, tombol Edit, Reset Password, dan Nonaktif tampil dalam 3 kolom di desktop.
- Export menggunakan `.xlsx`, bukan CSV.
- Template heading Excel rapi, tebal, berwarna, freeze row, dan mudah dibaca.

### 9.3 Import Anggota Excel

Deskripsi:

Admin dapat import anggota dari file Excel.

Kriteria penerimaan:

- Sistem membaca data anggota dari file Excel.
- Validasi NIK 16 digit berjalan.
- Data error ditampilkan agar dapat diperbaiki.

### 9.4 Manajemen Acara

Deskripsi:

Admin dapat membuat dan mengelola acara koperasi.

Fitur:

- Daftar acara.
- Tambah acara.
- Edit acara.
- Batalkan acara.
- Halaman detail acara.
- QR acara.
- Rekap presensi.

Kriteria penerimaan:

- Acara memiliki status draft, aktif, selesai, atau dibatalkan.
- Status acara dapat dihitung berdasarkan jadwal WIB.
- QR hanya valid untuk acara aktif.

### 9.5 Rekap Presensi

Deskripsi:

Admin dapat melihat rekap presensi per acara.

Kriteria penerimaan:

- Daftar anggota hadir ditampilkan di bagian atas.
- Daftar anggota tidak hadir ditampilkan di bawah daftar hadir.
- Export rekap presensi tersedia dalam Excel.
- Waktu hadir ditampilkan dalam WIB.

### 9.6 Laporan

Deskripsi:

Admin dapat menghasilkan laporan koperasi.

Fitur:

- Export data anggota ke Excel.
- Export presensi per acara ke Excel.
- Laporan ringkas PDF.

Kriteria penerimaan:

- Tidak ada export CSV di UI.
- File Excel memiliki heading yang mudah dibaca.
- Laporan PDF berisi ringkasan anggota dan presensi acara.

### 9.7 Pengumuman

Deskripsi:

Admin dapat mengelola pengumuman publik.

Fitur:

- Daftar pengumuman.
- Tambah pengumuman.
- Edit pengumuman.
- Hapus pengumuman.
- Status publish/draft.

### 9.8 Audit Log

Deskripsi:

Audit log mencatat aktivitas sensitif admin.

Kriteria penerimaan:

- Audit log tampil maksimal 10 baris per halaman.
- Aksi create, update, delete, reset password, import, dan export dapat dicatat.

### 9.9 Dashboard Admin Tema Terang/Gelap

Deskripsi:

Admin dapat mengganti tema dashboard.

Kriteria penerimaan:

- Switch tema tersedia di navbar admin.
- Mobile menampilkan tombol tema ringkas.
- Desktop menampilkan tombol tema dan identitas admin.
- Preferensi tema disimpan di localStorage.

## 10. Fitur Anggota

### 10.1 Dashboard Anggota

Deskripsi:

Dashboard anggota menampilkan sapaan, shortcut, dan riwayat terbaru.

Kriteria penerimaan:

- Menampilkan nama anggota dan nomor anggota.
- Shortcut ke Profil, Acara, dan Presensi QR.
- Riwayat Terbaru memakai pagination.
- Riwayat terbaru tidak memotong data permanen, hanya membagi halaman.

### 10.2 Profil Anggota

Deskripsi:

Anggota dapat melihat dan memperbarui data profil tertentu.

Data yang dapat diubah:

- Nama lengkap.
- Tempat lahir.
- Tanggal lahir.
- No HP.
- Alamat.

Data read-only:

- No anggota.
- NIK.
- Status.

Kriteria penerimaan:

- Avatar memakai ikon orang, bukan inisial.
- Mobile avatar berada di tengah.
- Desktop tetap memakai ikon orang.

### 10.3 Acara Anggota

Deskripsi:

Anggota dapat melihat daftar acara koperasi.

Kriteria penerimaan:

- Acara aktif dan draft dapat dilihat anggota.
- Detail acara menampilkan informasi jadwal dan lokasi.

### 10.4 Riwayat Kehadiran

Deskripsi:

Anggota dapat melihat riwayat presensi pribadi.

Kriteria penerimaan:

- Riwayat Kehadiran memakai pagination 10 baris per halaman.
- Mobile memakai card agar tidak perlu horizontal scroll.
- Desktop memakai tabel.

### 10.5 Presensi QR

Deskripsi:

Anggota dapat scan QR acara untuk mencatat kehadiran.

Kriteria penerimaan:

- Scanner berjalan dari browser.
- Token QR divalidasi server-side.
- Mode demo menyediakan acara aktif harian untuk pengujian scan.
- Data demo tidak wajib tersimpan permanen.

### 10.6 Dashboard Anggota Tema Terang/Gelap

Deskripsi:

Anggota dapat mengganti tema dashboard.

Kriteria penerimaan:

- Mobile navbar kanan diganti tombol switch tema.
- Desktop tetap menampilkan identitas anggota dan tombol tema.
- Preferensi tema disimpan di localStorage.

## 11. Authentication dan Authorization

Role utama:

- Public visitor.
- Anggota.
- Admin.

Ketentuan:

- Public visitor dapat melihat profil publik tanpa login.
- Anggota login menggunakan NIK dan password.
- Admin login menggunakan akun admin Supabase.
- Route admin hanya dapat diakses admin.
- Route anggota hanya dapat diakses anggota yang login.
- Presensi QR harus divalidasi di server, bukan hanya client.

## 12. Data dan Model Utama

Entitas utama:

- Profile/User.
- Member.
- Event.
- Attendance.
- Announcement.
- AuditLog.
- UnitGroup.
- UnitPoint.
- BoardMember.
- GalleryItem.
- Product.
- SiteProfile.

Catatan data:

- Timestamp disimpan UTC.
- Tampilan waktu menggunakan WIB.
- Soft delete digunakan untuk anggota dan acara.
- Riwayat presensi tidak ikut terhapus.
- Demo mode memakai data lokal dari `src/lib/data.ts`.
- Produksi disiapkan menggunakan Supabase.

## 13. Non-functional Requirements

### 13.1 Responsiveness

- Aplikasi harus nyaman dipakai di desktop, tablet, dan mobile.
- Tabel besar harus memiliki horizontal scroll hanya jika diperlukan.
- Section publik harus terbaca jelas pada layar presentasi.

### 13.2 Performance

- Halaman publik harus ringan untuk koneksi desa yang tidak selalu stabil.
- Gambar harus menggunakan aset yang relevan dan tidak terlalu berat.
- Peta hanya dimuat pada halaman/section yang membutuhkannya.

### 13.3 Accessibility

- Tombol ikon harus memiliki label aksesibilitas.
- Kontras teks harus cukup pada tema terang dan gelap.
- Navigasi harus bisa dipahami tanpa instruksi panjang.

### 13.4 Security

- Validasi input dilakukan di server.
- Admin route dilindungi role.
- QR presensi divalidasi server-side.
- Audit log mencatat aksi sensitif.
- Service role Supabase hanya dipakai di server.

### 13.5 Reliability

- Mode demo harus tetap berjalan tanpa Supabase.
- Jika konfigurasi Supabase tidak tersedia, sistem fallback ke data demo.
- Export Excel dan PDF tetap bisa digunakan di browser modern.

## 14. Success Metrics

Metrik demo:

- Warga dapat memahami fungsi koperasi dalam waktu kurang dari 5 menit presentasi.
- Pengurus dapat mendemokan scan QR tanpa setup database tambahan.
- Admin dapat membuka rekap hadir/tidak hadir dan export Excel.
- Halaman unit dapat menunjukkan lokasi Saprotan, Gudang Alpukat, Bibit/Sekretariat, dan Balai Desa.

Metrik produksi:

- 100 persen anggota aktif dapat terdata dengan NIK valid.
- Presensi acara dapat direkap kurang dari 1 menit setelah acara selesai.
- Laporan anggota dan presensi dapat diexport tanpa pengolahan manual ulang.
- Pengurus dapat memperbarui pengumuman tanpa bantuan developer.

## 15. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Koneksi internet lemah saat presentasi | Demo terganggu | Siapkan browser sudah terbuka dan data demo lokal |
| Kamera perangkat tidak mendukung scanner | Scan QR gagal | Siapkan perangkat cadangan atau input token manual jika dikembangkan |
| Data anggota salah saat import | Rekap tidak akurat | Validasi NIK, preview error, dan template Excel rapi |
| Pengurus belum terbiasa dashboard | Operasional lambat | UI dibuat ringkas, tombol detail ditegaskan, dan laporan dibuat otomatis |
| Supabase belum dikonfigurasi | Fitur produksi tidak menyimpan data | Mode demo tetap berjalan, setup Supabase dilakukan sebelum produksi |
| Galeri hardcoded | Admin tidak bisa update galeri sendiri | Masuk roadmap CMS/Storage galeri jika dibutuhkan |

## 16. Roadmap

### Fase 1 - Demo Presentasi

Status: selesai.

Cakupan:

- Landing page publik.
- Unit dan peta interaktif.
- Dashboard admin.
- Dashboard anggota.
- Demo presensi QR.
- Export Excel/PDF.
- Deploy Vercel demo.

### Fase 2 - Produksi Dasar

Cakupan:

- Aktivasi Supabase produksi.
- Migrasi data anggota riil.
- Akun admin koperasi.
- Testing import Excel data warga.
- Backup database dan file.
- Dokumentasi operasional pengurus.

### Fase 3 - Operasional Lanjutan

Cakupan opsional:

- Manajemen galeri dari admin.
- Notifikasi WhatsApp untuk acara.
- Upload foto anggota.
- Role operator selain admin utama.
- Dashboard statistik lebih lengkap.
- Modul stok Saprotan.
- Modul transaksi atau simpan pinjam jika diperlukan.

## 17. Open Questions

- Apakah data anggota riil akan dimigrasikan dari Excel yang sudah ada?
- Siapa admin utama koperasi setelah masa KKN selesai?
- Apakah koperasi ingin galeri tetap hardcoded atau bisa dikelola admin?
- Apakah presensi QR perlu mendukung anggota tanpa login?
- Apakah laporan bulanan/tahunan memerlukan format resmi tertentu?
- Apakah unit usaha akan bertambah setelah Saprotan, Gudang Alpukat, dan Bibit/Sekretariat?

## 18. Acceptance Checklist

- [ ] Halaman publik bisa dibuka tanpa login.
- [ ] Navigasi one-scroll berfungsi.
- [ ] Galeri menampilkan 6 foto.
- [ ] Peta unit tampil dan marker sesuai lokasi.
- [ ] Modal detail unit terbuka dari tombol Lihat Detail.
- [ ] Tombol Google Maps membuka koordinat unit.
- [ ] Admin bisa login.
- [ ] Admin bisa melihat dashboard.
- [ ] Admin bisa melihat grafik kehadiran per acara.
- [ ] Admin bisa melihat anggota terbaru dengan pagination.
- [ ] Admin bisa export Excel.
- [ ] Admin bisa melihat daftar hadir dan tidak hadir.
- [ ] Audit log memakai pagination 10 baris.
- [ ] Anggota bisa login.
- [ ] Anggota bisa melihat dashboard.
- [ ] Anggota bisa melihat riwayat terbaru dengan pagination.
- [ ] Menu Riwayat Kehadiran memakai 10 baris per halaman.
- [ ] Scanner QR dapat dibuka di browser.
- [ ] Tema terang/gelap berfungsi di admin dan anggota.
- [ ] Build production berhasil.
- [ ] Deploy Vercel berhasil.

## 19. Catatan Implementasi Saat Ini

- Demo production berjalan di Vercel.
- Data demo utama berada di `src/lib/data.ts`.
- Galeri publik hardcoded agar tidak membutuhkan storage.
- Peta memakai Leaflet/OpenStreetMap.
- Export laporan admin memakai Excel `.xlsx`, bukan CSV.
- PDF laporan ringkas tersedia dari halaman laporan admin.
- Supabase schema tersedia di `supabase/schema.sql`.
- Prisma schema tersedia di `prisma/schema.prisma`.
- File GeoJSON lama tidak digunakan pada implementasi peta saat ini.
