import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { QrScanner } from "@/components/presensi/qr-scanner";
import { getSessionUser } from "@/lib/auth";
import { getSessionGuest } from "@/lib/guest-auth";

export default async function PresensiScanPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const [session, guest] = await Promise.all([getSessionUser(), getSessionGuest()]);
  const next = token ? `/presensi/scan?token=${encodeURIComponent(token)}` : "/presensi/scan";

  if (session && session.role !== "anggota") {
    redirect("/admin/dashboard");
  }

  if (session?.role === "anggota" && session.mustChangePassword) {
    redirect("/anggota/ganti-password");
  }

  if (!session && !guest) {
    redirect(`/tamu/login?next=${encodeURIComponent(next)}`);
  }

  const isGuest = !session && Boolean(guest);

  return (
    <div className="min-h-screen bg-surface-gray">
      <header className="sticky top-0 z-40 border-b border-border-subtle bg-white">
        <div className="container-page flex h-16 items-center justify-between">
          <Link className="flex min-h-11 items-center gap-2 font-bold text-primary" href={isGuest ? "/" : "/anggota/dashboard"}>
            <ArrowLeft size={18} aria-hidden="true" />
            Kembali
          </Link>
          <p className="font-bold text-primary">Presensi Kehadiran</p>
          <span className="w-16" />
        </div>
      </header>
      <main className="container-page max-w-[640px] py-8">
        <QrScanner initialToken={token} viewer={isGuest ? "tamu" : "anggota"} />
      </main>
    </div>
  );
}
