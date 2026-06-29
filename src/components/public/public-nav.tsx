"use client";

import { siteAssetUrl } from "@/lib/site-assets";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogIn, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";

const LANDING_SECTIONS = ["tentang", "produk", "unit", "galeri", "struktur", "pengumuman"];

const navItems = [
  { href: "/", label: "Beranda" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#produk", label: "Produk" },
  { href: "/#unit", label: "Unit" },
  { href: "/#galeri", label: "Galeri" },
  { href: "/#struktur", label: "Struktur" },
  { href: "/#pengumuman", label: "Pengumuman" }
];

export function PublicNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const visibleSections = useRef<Set<string>>(new Set());

  // Scrollspy: highlight the nav item for the landing section currently in view.
  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const elements = LANDING_SECTIONS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el)
    );
    if (!elements.length) return;

    visibleSections.current = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visibleSections.current.add(entry.target.id);
          else visibleSections.current.delete(entry.target.id);
        });
        // Topmost section (in document order) that is in view; "" means hero/top.
        setActiveSection(LANDING_SECTIONS.find((id) => visibleSections.current.has(id)) ?? "");
      },
      { rootMargin: "-45% 0px -55% 0px" }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [pathname]);

  function isActive(href: string) {
    if (pathname === "/") {
      if (href === "/") return activeSection === "";
      if (href.startsWith("/#")) return href.slice(2) === activeSection;
      return false;
    }
    return pathname === href;
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border-subtle bg-white/95 backdrop-blur">
      <div className="container-page flex h-20 items-center justify-between">
        <Link href="/" className="flex min-h-11 items-center gap-3 text-primary" aria-label="Beranda Koperasi AML">
          <img src={siteAssetUrl("images/logo-koperasi.png")} alt="Logo Koperasi" className="h-11 w-11 shrink-0 object-contain" />
          <span className="max-w-[190px] text-base font-extrabold leading-tight sm:max-w-none sm:text-xl">
            Agro Mulyo Lestari
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigasi utama">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center rounded-lg px-3 text-sm font-bold transition",
                  active ? "bg-surface-container-low text-primary" : "text-on-surface-variant hover:bg-surface-gray hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href="/login" className="rounded-full">
            <LogIn size={18} aria-hidden="true" />
            Login
          </ButtonLink>
        </div>

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle text-primary lg:hidden"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-border-subtle bg-white lg:hidden">
          <nav className="container-page grid gap-2 py-4" aria-label="Navigasi mobile">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center rounded-lg px-3 font-bold text-on-surface-variant hover:bg-surface-gray"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <ButtonLink href="/login" onClick={() => setOpen(false)}>
              Login
            </ButtonLink>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
