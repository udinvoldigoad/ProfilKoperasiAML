import { AnggotaShell } from "@/components/anggota/anggota-shell";

export default function AnggotaLayout({ children }: { children: React.ReactNode }) {
  return <AnggotaShell>{children}</AnggotaShell>;
}
