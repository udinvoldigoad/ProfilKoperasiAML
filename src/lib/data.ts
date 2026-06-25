import type {
  Announcement,
  Attendance,
  AuditLog,
  BoardMember,
  Event,
  GalleryItem,
  Member,
  Post,
  Product,
  UnitGroup
} from "@/types";
import { eventEndToUtc } from "@/lib/utils";

export const siteProfile = {
  name: "Koperasi Agro Mulyo Lestari",
  shortName: "Koperasi AML",
  village: "Desa Giri Mulyo",
  district: "Kecamatan Marga Sekampung",
  regency: "Kabupaten Lampung Timur",
  address: "Desa Giri Mulyo, Kec. Marga Sekampung, Kab. Lampung Timur",
  whatsapp: "+6281234567890",
  email: "admin@agrimulyolestari.id",
  operationalHours: "Senin - Jumat, 08.00 - 15.00 WIB",
  heroImage: "/images/hero-desa-giri-mulyo.png",
  meetingImage: "/images/rapat-koperasi.png"
};

export const stats = [
  { label: "Anggota Aktif", value: "450+", tone: "primary" },
  { label: "Acara Tahunan", value: "24", tone: "secondary" },
  { label: "Unit Usaha", value: "5", tone: "tertiary" },
  { label: "Produk Layanan", value: "8", tone: "primary" }
];

export const members: Member[] = [
  {
    id: "m-001",
    profileId: "p-001",
    memberNumber: "AML-2026-0001",
    fullName: "Ahmad Sulaiman",
    nik: "1807061204860001",
    birthPlace: "Lampung Timur",
    birthDate: "1986-04-12",
    address: "Dusun Krajan, Desa Giri Mulyo",
    email: "ahmad@example.com",
    phone: "+6281270010001",
    status: "aktif",
    memberType: "anggota_lama",
    createdAt: "2026-01-15T02:10:00.000Z"
  },
  {
    id: "m-002",
    profileId: "p-002",
    memberNumber: "AML-2026-0002",
    fullName: "Siti Pertiwi",
    nik: "1807065207900002",
    birthPlace: "Lampung Timur",
    birthDate: "1990-07-12",
    address: "Dusun Sumber Makmur, Desa Giri Mulyo",
    phone: "+6281270010002",
    status: "aktif",
    memberType: "anggota_baru",
    createdAt: "2026-02-04T03:20:00.000Z"
  },
  {
    id: "m-003",
    profileId: "p-003",
    memberNumber: "AML-2026-0003",
    fullName: "Budi Santoso",
    nik: "1807061805810003",
    birthPlace: "Marga Sekampung",
    birthDate: "1981-05-18",
    address: "Jl. Usaha Tani RT 02 RW 01",
    email: "budi@example.com",
    phone: "+6281270010003",
    status: "ditangguhkan",
    memberType: "anggota_lama",
    createdAt: "2026-02-12T07:00:00.000Z"
  },
  {
    id: "m-004",
    profileId: "p-004",
    memberNumber: "AML-2026-0004",
    fullName: "Dewi Lestari",
    nik: "1807066506920004",
    birthPlace: "Lampung Timur",
    birthDate: "1992-06-25",
    address: "Dusun Tani Makmur, Desa Giri Mulyo",
    phone: "+6281270010004",
    status: "aktif",
    memberType: "anggota_baru",
    createdAt: "2026-03-02T04:40:00.000Z"
  }
];

export const events: Event[] = [
  {
    id: "e-001",
    title: "Rapat Anggota Tahunan 2026",
    date: "2026-07-02",
    startTime: "08:30",
    endTime: "11:30",
    location: "Balai Desa Giri Mulyo",
    description: "Pembahasan laporan tahunan, program kerja, dan evaluasi pelayanan anggota.",
    status: "aktif",
    qrToken: "rat-2026-aml-secure",
    qrExpiresAt: eventEndToUtc("2026-07-02", "11:30")
  },
  {
    id: "e-002",
    title: "Pelatihan Digitalisasi Usaha Tani",
    date: "2026-07-12",
    startTime: "09:00",
    endTime: "12:00",
    location: "Aula Koperasi AML",
    description: "Pelatihan pencatatan usaha tani dan pemasaran produk secara digital.",
    status: "draft",
    qrToken: "pelatihan-digital-aml",
    qrExpiresAt: eventEndToUtc("2026-07-12", "12:00")
  },
  {
    id: "e-003",
    title: "Koordinasi Distribusi Hasil Panen",
    date: "2026-06-16",
    startTime: "13:00",
    endTime: "15:00",
    location: "Gudang Unit Distribusi",
    description: "Koordinasi jadwal distribusi gabah dan sayur ke mitra pasar.",
    status: "selesai",
    qrToken: "distribusi-panen-aml",
    qrExpiresAt: eventEndToUtc("2026-06-16", "15:00")
  }
];

export const attendances: Attendance[] = [
  { id: "a-001", eventId: "e-003", memberId: "m-001", attendedAt: "2026-06-16T06:18:00.000Z", method: "qr_code" },
  { id: "a-002", eventId: "e-003", memberId: "m-002", attendedAt: "2026-06-16T06:21:00.000Z", method: "manual" },
  { id: "a-003", eventId: "e-003", memberId: "m-004", attendedAt: "2026-06-16T06:24:00.000Z", method: "qr_code" }
];

export const boardMembers: BoardMember[] = [
  // Edit di sini. level: 1 = Ketua (atas), 2 = baris kedua, 3 = baris ketiga, dst.
  // sortOrder: urutan kiri-ke-kanan dalam satu baris. photoUrl: kosongkan untuk inisial.
  { id: "b-ketua", name: "Suparno", position: "Ketua Koperasi", photoUrl: "", level: 1, sortOrder: 1 },
  { id: "b-sekretaris", name: "Kristiana Putra", position: "Sekretaris", photoUrl: "", level: 2, sortOrder: 1 },
  { id: "b-bendahara", name: "Pranoto", position: "Bendahara", photoUrl: "", level: 2, sortOrder: 2 },
  { id: "b-pengawas-1", name: "Asmawik", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 1 },
  { id: "b-pengawas-2", name: "Edy Sukarno", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 2 },
  { id: "b-pengawas-3", name: "Sanyor Hermawan", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 3 },
  { id: "b-pengawas-4", name: "Taryoso", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 4 },
  { id: "b-pengawas-5", name: "Sriyono", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 5 }
];

export const products: Product[] = [
  {
    id: "pr-002",
    title: "Sarana Produksi Pertanian",
    description: "Penyediaan pupuk, benih, dan alat pendukung kebutuhan usaha tani anggota.",
    imageUrl: "/images/hero-desa-giri-mulyo.png",
    category: "Pertanian",
    status: "aktif"
  },
  {
    id: "pr-003",
    title: "Jual Beli Bibit Pertanian",
    description: "Penyediaan dan penjualan bibit unggul tanaman pertanian untuk anggota dan warga.",
    imageUrl: "/images/hero-desa-giri-mulyo.png",
    category: "Pertanian",
    status: "aktif"
  },
  {
    id: "pr-004",
    title: "Gudang Distribusi Pertanian Alpukat",
    description: "Pengumpulan, penyortiran, dan distribusi hasil panen alpukat ke mitra pasar.",
    imageUrl: "/images/rapat-koperasi.png",
    category: "Distribusi",
    status: "aktif"
  }
];

export const posts: Post[] = [
  {
    id: "post-001",
    title: "RAT 2026 Fokus pada Transparansi dan Digitalisasi",
    slug: "rat-2026-fokus-transparansi-digitalisasi",
    excerpt: "Koperasi menyiapkan sistem data anggota dan presensi QR untuk pelayanan yang lebih tertib.",
    content:
      "Rapat Anggota Tahunan 2026 menjadi momentum penting bagi Koperasi Agro Mulyo Lestari untuk memperkuat tata kelola. Pengurus memprioritaskan data anggota yang rapi, rekap kegiatan yang mudah diaudit, dan pelayanan yang lebih transparan bagi masyarakat desa.",
    thumbnailUrl: "/images/rapat-koperasi.png",
    category: "Kegiatan",
    author: "Admin Koperasi",
    status: "publish",
    publishedAt: "2026-06-20T02:00:00.000Z"
  },
  {
    id: "post-002",
    title: "Program Pengadaan Kebutuhan Pertanian Masuk Tahap Pendataan",
    slug: "program-pengadaan-kebutuhan-pertanian",
    excerpt: "Pendataan kebutuhan pupuk dan bibit dilakukan agar distribusi lebih tepat sasaran.",
    content:
      "Pengurus koperasi membuka pendataan kebutuhan pertanian untuk anggota aktif. Program ini membantu koperasi menghimpun kebutuhan secara kolektif sehingga harga dan distribusi dapat dikelola lebih baik.",
    thumbnailUrl: "/images/hero-desa-giri-mulyo.png",
    category: "Produk Layanan",
    author: "Admin Koperasi",
    status: "publish",
    publishedAt: "2026-06-12T03:00:00.000Z"
  }
];

export const hardcodedGallery: GalleryItem[] = [
  {
    id: "g-001",
    title: "Lanskap Pertanian Giri Mulyo",
    imageUrl: "/images/hero-desa-giri-mulyo.png",
    description: "Dokumentasi visual potensi agraris desa sebagai identitas koperasi.",
    eventDate: "2026-06-01",
    category: "Potensi Desa"
  },
  {
    id: "g-002",
    title: "Rapat Koordinasi Pengurus",
    imageUrl: "/images/rapat-koperasi.png",
    description: "Kegiatan koordinasi pengurus untuk program pelayanan anggota.",
    eventDate: "2026-06-14",
    category: "Kegiatan"
  },
  {
    id: "g-003",
    title: "Persiapan Program Digital",
    imageUrl: "/images/rapat-koperasi.png",
    description: "Pendampingan awal sistem data anggota dan presensi kegiatan koperasi.",
    eventDate: "2026-06-21",
    category: "Digitalisasi"
  }
];

// Hardcoded units (edit here). A unit category can hold several location points.
export const unitGroups: UnitGroup[] = [
  {
    id: "saprotan",
    name: "Sarana Produksi Pertanian (Saprotan)",
    category: "Saprotan",
    type: "Toko pertanian",
    description: "Penyedia kebutuhan perawatan perkebunan dan sarana produksi pertanian bagi anggota dan warga.",
    status: "aktif",
    points: [
      {
        id: "saprotan-1",
        name: "Toko Saprotan",
        latitude: -5.374346,
        longitude: 105.662872,
        address: "Jl. Diponegoro RT 6 RW 2 Dusun 2 Marga Sekampung, Kab. Lampung Timur",
        landmark: "0,38 KM dari balai desa",
        manager: "Andromeda Bagus Satria",
        hours: "06.00 - 22.00 WIB",
        contact: "082150077353"
      }
    ]
  },
  {
    id: "alpukat",
    name: "Gudang Distribusi Pertanian Alpukat",
    category: "Distribusi Alpukat",
    type: "Pemasaran / pengumpul buah alpukat",
    description:
      "Pengumpulan, penimbangan, pemasaran, dan penjaminan pembelian hasil panen alpukat petani. Tersebar di beberapa titik pengumpul.",
    status: "aktif",
    points: [
      {
        id: "alpukat-anton",
        name: "Pengumpul Mas Anton",
        latitude: -5.376928,
        longitude: 105.66379,
        address: "Jl. P. Senopati, Marga Sekampung, Kab. Lampung Timur, Lampung 35152",
        landmark: "0,59 KM dari balai desa",
        manager: "Anton Marzuki",
        hours: "Menyesuaikan aktivitas panen",
        contact: "082177779347"
      },
      {
        id: "alpukat-tdah",
        name: "Pengumpul TDAH Buah",
        latitude: -5.377098,
        longitude: 105.663883,
        address: "Jl. P. Senopati, Dusun 2 RT 7 Marga Sekampung, Kab. Lampung Timur, Lampung 35152",
        landmark: "0,61 KM dari balai desa",
        manager: "Misnadi",
        hours: "Menyesuaikan aktivitas panen",
        contact: "081366732877"
      },
      {
        id: "alpukat-pahrul",
        name: "Pengumpul Pahrul Buah",
        latitude: -5.375964,
        longitude: 105.665787,
        address: "Jl. P. Senopati, RT 9 Dusun 2, Marga Sekampung, Kab. Lampung Timur, Lampung 35152",
        landmark: "0,73 KM dari balai desa",
        manager: "Pahrul",
        hours: "Menyesuaikan aktivitas panen",
        contact: "081278899761"
      }
    ]
  },
  {
    id: "bibit",
    name: "Jual Beli Bibit Pertanian",
    category: "Bibit",
    type: "Penyediaan & penjualan bibit",
    description: "Penyediaan dan penjualan bibit unggul tanaman pertanian untuk anggota dan warga. Data lokasi menyusul.",
    status: "menyusul",
    points: []
  }
];

export const announcements: Announcement[] = [
  {
    id: "ann-001",
    title: "Rapat Anggota Tahunan (RAT) 2026",
    body: "Seluruh anggota koperasi diundang menghadiri Rapat Anggota Tahunan 2026 di Balai Desa Giri Mulyo. Mohon hadir tepat waktu dan membawa kartu anggota untuk presensi.",
    date: "2026-06-20",
    category: "Kegiatan",
    pinned: true
  },
  {
    id: "ann-002",
    title: "Pendataan Kebutuhan Pupuk Musim Tanam",
    body: "Unit Sarana Produksi Pertanian membuka pendataan kebutuhan pupuk dan benih untuk musim tanam berikutnya. Anggota dapat mendaftar melalui pengurus unit hingga akhir bulan.",
    date: "2026-06-12",
    category: "Layanan"
  },
  {
    id: "ann-003",
    title: "Jadwal Distribusi Panen Alpukat",
    body: "Gudang Distribusi Pertanian Alpukat mengumumkan jadwal pengumpulan hasil panen setiap hari Senin dan Kamis. Pastikan hasil panen sudah disortir sebelum diserahkan.",
    date: "2026-06-05",
    category: "Distribusi"
  }
];

export const auditLogs: AuditLog[] = [
  {
    id: "log-001",
    actor: "Admin Utama",
    action: "reset_password",
    entityType: "members",
    summary: "Reset password sementara untuk Ahmad Sulaiman",
    createdAt: "2026-06-24T03:10:00.000Z"
  },
  {
    id: "log-002",
    actor: "Admin Utama",
    action: "create",
    entityType: "events",
    summary: "Membuat acara Rapat Anggota Tahunan 2026",
    createdAt: "2026-06-23T08:40:00.000Z"
  },
  {
    id: "log-003",
    actor: "Admin Utama",
    action: "export",
    entityType: "attendances",
    summary: "Export rekap presensi acara distribusi panen",
    createdAt: "2026-06-17T02:25:00.000Z"
  }
];

export function getPostBySlug(slug: string) {
  return posts.find((post) => post.slug === slug && post.status === "publish");
}

export function getEventById(id: string) {
  return events.find((event) => event.id === id);
}

export function getMemberById(id: string) {
  return members.find((member) => member.id === id);
}

export function attendanceRowsForEvent(eventId: string) {
  return members
    .filter((member) => member.status === "aktif")
    .map((member) => {
      const attendance = attendances.find((item) => item.eventId === eventId && item.memberId === member.id);
      return {
        member,
        attendance,
        status: attendance ? "Hadir" : "Tidak Hadir"
      };
    });
}
