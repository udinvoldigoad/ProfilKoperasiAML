export type Role = "admin" | "anggota";

export const DASHBOARD_BY_ROLE: Record<Role, string> = {
  admin: "/admin/dashboard",
  anggota: "/anggota/dashboard"
};
