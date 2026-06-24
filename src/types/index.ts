export type MemberStatus = "aktif" | "nonaktif" | "ditangguhkan";
export type MemberType = "anggota_lama" | "anggota_baru";
export type EventStatus = "draft" | "aktif" | "selesai" | "dibatalkan";
export type PublishStatus = "draft" | "publish";

export type Member = {
  id: string;
  profileId: string;
  memberNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  photoUrl?: string;
  email?: string;
  phone?: string;
  status: MemberStatus;
  memberType: MemberType;
  createdAt: string;
};

export type Event = {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: EventStatus;
  qrToken: string;
  qrExpiresAt: string;
};

export type Attendance = {
  id: string;
  eventId: string;
  memberId: string;
  attendedAt: string;
  method: "qr_code" | "manual";
};

export type BoardMember = {
  id: string;
  name: string;
  position: string;
  photoUrl: string;
  contact?: string;
  period?: string;
  sortOrder: number;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: string;
  status: "aktif" | "nonaktif";
};

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  thumbnailUrl: string;
  category: string;
  author: string;
  status: PublishStatus;
  publishedAt: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
  eventDate: string;
  category: string;
};

export type Unit = {
  id: string;
  name: string;
  type: string;
  address: string;
  latitude: number;
  longitude: number;
  contact?: string;
  description: string;
  photoUrl?: string;
  mapsUrl?: string;
  status: "aktif" | "nonaktif";
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string;
  category: string;
  pinned?: boolean;
};

export type AuditLog = {
  id: string;
  actor: string;
  action: string;
  entityType: string;
  summary: string;
  createdAt: string;
};
