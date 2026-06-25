import { AdminShell } from "@/components/admin/admin-shell";

// The admin dashboard is authenticated and data-driven: every page must render
// fresh on each request, never as a build-time static snapshot (which would show
// stale lists after create/edit/delete).
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
