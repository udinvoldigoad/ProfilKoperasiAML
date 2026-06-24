import type { Metadata } from "next";
import Link from "next/link";
import { Leaf, MessageCircle, ShieldCheck, UserRound } from "lucide-react";
import { PublicShell } from "@/components/public/public-shell";
import { Card } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/login-form";
import { siteProfile } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = {
  title: "Login",
  description: "Login admin dan anggota Koperasi Agri Mulyo Lestari. Anggota masuk memakai NIK."
};

const waLink = `https://wa.me/${siteProfile.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Halo Admin Koperasi Agri Mulyo Lestari, saya ingin mendaftar sebagai anggota koperasi."
)}`;

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  const configured = isSupabaseConfigured();

  return (
    <PublicShell>
      <section className="container-page flex min-h-[70vh] items-center justify-center py-12 sm:py-16">
        <div className="w-full max-w-md">
          <div className="text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-container text-white shadow-soft">
              <Leaf size={26} aria-hidden="true" />
            </span>
            <h1 className="mt-4 text-2xl font-extrabold text-primary sm:text-3xl">Masuk Portal Koperasi</h1>
            <p className="mt-2 text-sm text-on-surface-variant">
              Anggota masuk dengan <strong>NIK</strong>, admin dengan <strong>email</strong>.
            </p>
          </div>

          <Card className="mt-6 shadow-soft">
            {configured ? (
              <LoginForm next={next} />
            ) : (
              <div className="grid gap-4">
                <p className="rounded-lg bg-surface-container-low px-4 py-3 text-center text-sm text-on-surface-variant">
                  Mode demo aktif — Supabase belum dikonfigurasi. Masuk tanpa kredensial untuk menjelajah portal.
                </p>
                <Link
                  href="/api/auth/demo-login?role=admin&next=/admin/dashboard"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white"
                >
                  <ShieldCheck size={18} aria-hidden="true" />
                  Masuk sebagai Admin (Demo)
                </Link>
                <Link
                  href="/api/auth/demo-login?role=anggota&next=/anggota/dashboard"
                  className="flex min-h-12 items-center justify-center gap-2 rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary-container"
                >
                  <UserRound size={18} aria-hidden="true" />
                  Masuk sebagai Anggota (Demo)
                </Link>
              </div>
            )}
          </Card>

          {/* No-account path: direct the user to register through the admin via WhatsApp. */}
          <div className="mt-6">
            <div className="flex items-center gap-3">
              <span className="h-px flex-1 bg-border-subtle" />
              <span className="text-xs font-bold uppercase tracking-wide text-muted-text">Belum punya akun?</span>
              <span className="h-px flex-1 bg-border-subtle" />
            </div>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-4 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
            >
              <MessageCircle size={18} aria-hidden="true" />
              Daftar lewat Admin via WhatsApp
            </a>
            <p className="mt-3 text-center text-sm text-muted-text">
              Akun anggota dibuat oleh admin koperasi untuk menjaga validitas data. Hubungi admin untuk pendaftaran dan
              aktivasi NIK Anda.
            </p>
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
