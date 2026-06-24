import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QrScanner } from "@/components/presensi/qr-scanner";
import { getSessionUser } from "@/lib/auth";

export default async function PresensiScanPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const session = await getSessionUser();

  if (!session) {
    const next = token ? `/presensi/scan?token=${encodeURIComponent(token)}` : "/presensi/scan";
    redirect(`/login?next=${encodeURIComponent(next)}`);
  }

  if (session.role !== "anggota" || !session.member) {
    redirect("/admin/dashboard");
  }

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link className="flex min-h-11 items-center gap-2 font-bold text-primary" href="/anggota/dashboard">
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali
          </Link>
          <p className="font-bold text-primary">Presensi Kehadiran</p>
          <span className="w-16" />
        </div>
      </header>
      <main className="container-page max-w-[640px] py-8">
        <QrScanner initialToken={token} />
      </main>
    </div>
  );
}
