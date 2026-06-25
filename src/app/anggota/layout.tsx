import { AnggotaShell } from "@/components/anggota/anggota-shell";

// Authenticated, per-member data: always render fresh, never a static snapshot.
export const dynamic = "force-dynamic";

export default function AnggotaLayout({ children }: { children: React.ReactNode }) {
  return <AnggotaShell>{children}</AnggotaShell>;
}
