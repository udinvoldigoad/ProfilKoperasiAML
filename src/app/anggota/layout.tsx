import { AnggotaShell } from "@/components/anggota/anggota-shell";
import { NotificationProvider } from "@/components/ui/notification";

// Authenticated, per-member data: always render fresh, never a static snapshot.
export const dynamic = "force-dynamic";

export default function AnggotaLayout({ children }: { children: React.ReactNode }) {
  return (
    <NotificationProvider>
      <AnggotaShell>{children}</AnggotaShell>
    </NotificationProvider>
  );
}
