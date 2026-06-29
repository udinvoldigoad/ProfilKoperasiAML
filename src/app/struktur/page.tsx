import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { ProfileStructureSection } from "@/components/public/profile-structure-section";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Struktur Keanggotaan",
  description: "Bagan silsilah kepengurusan Koperasi Agro Mulyo Lestari."
};

export default function StrukturPage() {
  return (
    <PublicShell>
      <ProfileStructureSection />
    </PublicShell>
  );
}
