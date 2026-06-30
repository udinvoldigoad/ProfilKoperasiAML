-- Pembersihan data operasional/demo Koperasi AML.
-- Aman untuk finalisasi produksi: akun admin, settings, struktur pengurus,
-- produk/layanan, dan unit koperasi tidak dihapus.
--
-- Jalankan di phpMyAdmin pada database koperasi.
-- Saran: Export/backup database dulu sebelum menjalankan script ini.

START TRANSACTION;

-- 1. Data presensi dan tamu.
DELETE FROM guest_attendances;
DELETE FROM guests;
DELETE FROM attendances;

-- 2. Log aktivitas demo.
DELETE FROM audit_logs;

-- 3. Data acara/agenda demo.
DELETE FROM events;

-- 4. Data anggota demo dan akun login anggota.
DELETE FROM members;
DELETE FROM profiles WHERE role = 'anggota';

-- 5. Konten publik yang berasal dari database/demo.
DELETE FROM announcements;
DELETE FROM gallery;
DELETE FROM posts;

COMMIT;

-- Cek hasil pembersihan.
SELECT 'guest_attendances' AS table_name, COUNT(*) AS total FROM guest_attendances
UNION ALL SELECT 'guests', COUNT(*) FROM guests
UNION ALL SELECT 'attendances', COUNT(*) FROM attendances
UNION ALL SELECT 'events', COUNT(*) FROM events
UNION ALL SELECT 'members', COUNT(*) FROM members
UNION ALL SELECT 'profiles_anggota', COUNT(*) FROM profiles WHERE role = 'anggota'
UNION ALL SELECT 'announcements', COUNT(*) FROM announcements
UNION ALL SELECT 'gallery', COUNT(*) FROM gallery
UNION ALL SELECT 'posts', COUNT(*) FROM posts
UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs;

