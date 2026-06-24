import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Koperasi Agri Mulyo Lestari",
    template: "%s | Koperasi Agri Mulyo Lestari"
  },
  description:
    "Website profil dan sistem manajemen anggota Koperasi Agri Mulyo Lestari, Desa Giri Mulyo, Lampung Timur.",
  openGraph: {
    title: "Koperasi Agri Mulyo Lestari",
    description:
      "Portal koperasi desa untuk profil publik, manajemen anggota, acara, dan presensi QR.",
    url: siteUrl,
    siteName: "Koperasi Agri Mulyo Lestari",
    images: ["/images/hero-desa-giri-mulyo.png"],
    locale: "id_ID",
    type: "website"
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#065366"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
