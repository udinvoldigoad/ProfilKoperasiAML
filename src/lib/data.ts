import type { BoardMember, GalleryItem, Product, UnitGroup } from "@/types";

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

export const boardMembers: BoardMember[] = [
  { id: "b-ketua", name: "Suparno", position: "Ketua Koperasi", photoUrl: "", level: 1, sortOrder: 1 },
  { id: "b-sekretaris", name: "Kristiana Putra", position: "Sekretaris", photoUrl: "", level: 2, sortOrder: 1 },
  { id: "b-bendahara", name: "Pranoto", position: "Bendahara", photoUrl: "", level: 2, sortOrder: 2 },
  { id: "b-pengawas-1", name: "Asmawik", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 1 },
  { id: "b-pengawas-2", name: "Edy Sukarno", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 2 },
  { id: "b-pengawas-3", name: "Sanyoto Hermawan", position: "Pengawas", photoUrl: "", level: 3, sortOrder: 3 },
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

export const galleryItems: GalleryItem[] = [
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
    description: "Gudang utama untuk penerimaan, penimbangan, dan distribusi buah alpukat anggota koperasi.",
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
