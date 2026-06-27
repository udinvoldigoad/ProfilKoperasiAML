import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSiteProfile } from "@/lib/db/settings";

export async function Footer() {
  const siteProfile = await getSiteProfile();
  return (
    <footer className="border-t border-border-subtle bg-[#dee9fd]">
      <div className="container-page grid gap-8 py-10 md:grid-cols-[1.2fr_0.8fr_1fr]">
        <div>
          <div className="flex items-center gap-3 text-primary">
            <img src="/images/logo-koperasi.png" alt="Logo Koperasi" className="h-11 w-11 shrink-0 object-contain" />
            <span className="text-xl font-extrabold">{siteProfile.name}</span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-on-surface-variant">
            Portal digital koperasi desa untuk profil publik, data anggota, agenda kegiatan, dan presensi yang tertib.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">Tautan</h2>
          <div className="mt-4 grid gap-3 text-sm text-on-surface-variant">
            <Link href="/#tentang" className="hover:text-primary">
              Tentang Koperasi
            </Link>
            <Link href="/#struktur" className="hover:text-primary">
              Struktur Keanggotaan
            </Link>
            <Link href="/#unit" className="hover:text-primary">
              Unit Koperasi
            </Link>
            <Link href="/#pengumuman" className="hover:text-primary">
              Pengumuman
            </Link>
            <Link href="/signup" className="hover:text-primary">
              Pendaftaran Anggota
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-bold text-primary">Kontak</h2>
          <div className="mt-4 grid gap-3 text-sm text-on-surface-variant">
            <p className="flex gap-2">
              <MapPin size={18} className="mt-1 shrink-0" aria-hidden="true" />
              <span>{siteProfile.address}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={18} aria-hidden="true" />
              <span>{siteProfile.whatsapp}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={18} aria-hidden="true" />
              <span>{siteProfile.email}</span>
            </p>
          </div>
        </div>
      </div>
      <div className="grid gap-1 border-t border-[#bfc8cc] py-5 text-center text-sm text-on-surface-variant">
        <p>Koperasi Agro Mulyo Lestari, Desa Giri Mulyo.</p>
        <p className="font-bold text-primary">&copy; KKN Rekognisi ITERA 2026</p>
      </div>
    </footer>
  );
}


