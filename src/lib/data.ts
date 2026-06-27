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

const WIB_TIMEZONE = "Asia/Jakarta";

function dateInWib(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: WIB_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => {
      if (part.type !== "literal") acc[part.type] = part.value;
      return acc;
    }, {});

  return `${parts.year}-${parts.month}-${parts.day}`;
}

export function getDemoScanEvent(now = new Date()): Event {
  const date = dateInWib(now);
  return {
    id: "e-demo-scan",
    title: "Simulasi Presensi QR Hari Ini",
    date,
    startTime: "00:00",
    endTime: "23:59",
    location: "Balai Desa Giri Mulyo",
    description: "Acara demo khusus presentasi. QR selalu aktif pada hari berjalan agar alur scan bisa diuji tanpa menyimpan data.",
    status: "aktif",
    qrToken: "demo-presensi-hari-ini",
    qrExpiresAt: eventEndToUtc(date, "23:59")
  };
}

export const siteProfile = {
  name: "Koperasi Agro Mulyo Lestari",
  shortName: "Koperasi AML",
  village: "Desa Giri Mulyo",
  district: "Kecamatan Marga Sekampung",
  regency: "Kabupaten Lampung Timur",
  address: "Desa Giri Mulyo, Kec. Marga Sekampung, Kab. Lampung Timur",
  whatsapp: "+6282376314085",
  email: "koperasiam1258@gmail.com",
  operationalHours: "Senin - Jumat, 08.00 - 15.00 WIB",
  heroImage: "/images/hero.jpeg",
  meetingImage: "/images/pokat uye.jpeg"
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

export function getDemoEvents(now = new Date()): Event[] {
  return [getDemoScanEvent(now), ...events];
}

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
    imageUrl: "/images/saprotan.jpeg",
    category: "Pertanian",
    status: "aktif"
  },
  {
    id: "pr-003",
    title: "Jual Beli Bibit Pertanian",
    description: "Penyediaan dan penjualan bibit unggul tanaman pertanian untuk anggota dan warga.",
    imageUrl: "/images/bibit siger.jpg",
    category: "Pertanian",
    status: "aktif"
  },
  {
    id: "pr-004",
    title: "Gudang Distribusi Pertanian Alpukat",
    description: "Pengumpulan, penyortiran, dan distribusi hasil panen alpukat ke mitra pasar.",
    imageUrl: "/images/gudang alpukat.jpeg",
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
    thumbnailUrl: "/images/pokat uye.jpeg",
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
    thumbnailUrl: "/images/saprotan.jpeg",
    category: "Produk Layanan",
    author: "Admin Koperasi",
    status: "publish",
    publishedAt: "2026-06-12T03:00:00.000Z"
  }
];

export const hardcodedGallery: GalleryItem[] = [
  {
    id: "g-001",
    title: "Hari Koperasi Nasional ke-77",
    imageUrl: "/images/girimulyo asik/hari koperasi nasional ke 77.jpeg",
    description: "Dokumentasi kegiatan Hari Koperasi Nasional ke-77 bersama warga dan pengurus.",
    eventDate: "2026-06-01",
    category: "Kegiatan"
  },
  {
    id: "g-002",
    title: "Juara 1 Pos Pelayanan Teknologi Tepat Guna",
    imageUrl: "/images/girimulyo asik/juara 1 pos pelayanan teknoologi tepat guna.jpeg",
    description: "Capaian desa dalam pengembangan pos pelayanan teknologi tepat guna.",
    eventDate: "2026-06-02",
    category: "Prestasi"
  },
  {
    id: "g-003",
    title: "Kunjungan Kerja",
    imageUrl: "/images/girimulyo asik/kunjungan kerja.jpeg",
    description: "Kunjungan kerja dan koordinasi untuk pengembangan program desa.",
    eventDate: "2026-06-03",
    category: "Kunjungan"
  },
  {
    id: "g-004",
    title: "Pameran Produk Desa",
    imageUrl: "/images/girimulyo asik/pameran.jpeg",
    description: "Pameran potensi dan produk unggulan Desa Giri Mulyo.",
    eventDate: "2026-06-04",
    category: "Pameran"
  },
  {
    id: "g-005",
    title: "Studi Banding",
    imageUrl: "/images/girimulyo asik/studi banding.jpeg",
    description: "Kegiatan studi banding untuk memperkuat tata kelola dan layanan desa.",
    eventDate: "2026-06-05",
    category: "Pembelajaran"
  },
  {
    id: "g-006",
    title: "Tanam Bibit",
    imageUrl: "/images/girimulyo asik/tanam bibit.jpeg",
    description: "Kegiatan penanaman bibit sebagai bagian dari penguatan potensi pertanian.",
    eventDate: "2026-06-06",
    category: "Pertanian"
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
    type: "Unit: Buah Alpukat",
    description:
      "Gudang utama untuk penerimaan, penimbangan, dan distribusi buah alpukat anggota koperasi.",
    status: "aktif",
    points: [
      {
        id: "gudang-alpukat-hadi-sutomo",
        name: "Lokasi Gudang",
        latitude: -5.370514,
        longitude: 105.651198,
        address: "Jalan P. Senopati, RT 26 Dusun 07, Marga Sekampung, Kabupaten Lampung Timur",
        landmark: "1,01 KM dari balai desa",
        coverage: "RHL ada dari luar juga dari Gunung",
        manager: "Hadi Sutomo",
        hours: "07.00 - sampai selesai",
        contact: "081367611473"
      }
    ]
  },
  {
    id: "bibit",
    name: "Jual Beli Bibit & Sekretariat Koperasi",
    category: "Bibit",
    type: "Unit: Pengumpulan Bibit",
    description: "Tempat pengumpulan bibit sekaligus kantor sekretariat Koperasi Agro Mulyo Lestari.",
    status: "aktif",
    points: [
      {
        id: "bibit-sekretariat-koperasi",
        name: "Jual Beli Bibit / Sekretariat Koperasi AML",
        latitude: -5.369669,
        longitude: 105.652952,
        address: "Dusun 7 RT 64, Jalan P. Senopati, Marga Sekampung, Lampung Timur",
        landmark: "0,86 KM dari balai desa",
        place: "Pengumpulan bibit",
        shippingArea: "Kalimantan, Papua, Sulawesi, Aceh, Medan, dan daerah lainnya",
        manager: "Bapak Suparno",
        contact: "0823-7631-4085"
      }
    ]
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
  return getDemoEvents().find((event) => event.id === id);
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
