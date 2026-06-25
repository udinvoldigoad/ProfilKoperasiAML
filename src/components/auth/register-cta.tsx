import { MessageCircle } from "lucide-react";
import { siteProfile } from "@/lib/data";

export function RegisterCta({ whatsapp = siteProfile.whatsapp }: { whatsapp?: string }) {
  const waLink = `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(
    "Halo Admin Koperasi Agri Mulyo Lestari, saya ingin mendaftar sebagai anggota koperasi."
  )}`;
  return (
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
  );
}
