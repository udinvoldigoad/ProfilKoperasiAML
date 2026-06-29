"use client";

import { siteAssetUrl } from "@/lib/site-assets";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  FileSpreadsheet,
  History,
  Images,
  LayoutDashboard,
  Megaphone,
  Menu,
  Settings,
  UserRound,
  Users,
  X
} from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/anggota/theme-toggle";
import { LogoutForm } from "@/components/auth/logout-form";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/anggota", label: "Anggota", icon: Users },
  { href: "/admin/acara", label: "Acara", icon: CalendarDays },
  { href: "/admin/pengumuman", label: "Pengumuman", icon: Megaphone },
  { href: "/admin/galeri", label: "Galeri", icon: Images },
  { href: "/admin/laporan", label: "Laporan", icon: FileSpreadsheet },
  { href: "/admin/audit-log", label: "Audit Log", icon: History },
  { href: "/admin/pengaturan", label: "Pengaturan", icon: Settings }
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebar = (
    <aside className="flex h-full w-72 flex-col border-r border-border-subtle bg-white px-4 py-5">
      <Link href="/admin/dashboard" className="mb-6 flex min-h-11 items-center gap-3 px-2 text-primary">
        <img src={siteAssetUrl("images/logo-koperasi.png")} alt="Logo Koperasi" className="h-11 w-11 shrink-0 object-contain" />
        <span>
          <span className="block text-lg font-extrabold leading-tight">Koperasi AML</span>
          <span className="block text-sm text-muted-text">Admin Portal</span>
        </span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto" aria-label="Navigasi admin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition",
                active ? "bg-primary-container text-white" : "text-on-surface-variant hover:bg-surface-gray hover:text-primary"
              )}
            >
              <Icon size={19} aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-5 border-t border-border-subtle pt-5">
        <LogoutForm />
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-surface-gray">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">{sidebar}</div>
      {open ? <div className="fixed inset-0 z-50 bg-black/30 lg:hidden" onClick={() => setOpen(false)} /> : null}
      <div className={cn("fixed inset-y-0 left-0 z-50 transform transition lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>
        {sidebar}
      </div>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 border-b border-border-subtle bg-white/95 backdrop-blur">
          <div className="flex h-16 items-center justify-between px-4 md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-border-subtle text-primary lg:hidden"
                onClick={() => setOpen((value) => !value)}
                aria-label={open ? "Tutup menu admin" : "Buka menu admin"}
              >
                {open ? <X size={21} aria-hidden="true" /> : <Menu size={21} aria-hidden="true" />}
              </button>
              <div>
                <p className="text-sm font-bold text-primary">Agro Mulyo Lestari</p>
                <p className="text-xs text-muted-text">Portal produksi koperasi</p>
              </div>
            </div>

            <div className="lg:hidden">
              <ThemeToggle compact />
            </div>
            <div className="hidden items-center gap-3 lg:flex">
              <ThemeToggle />
              <div className="flex items-center gap-3 rounded-full border border-border-subtle bg-white py-1 pl-1 pr-4">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-white">
                  <UserRound size={19} strokeWidth={2.4} aria-hidden="true" />
                </span>
                <span className="text-sm font-bold text-primary">Admin Utama</span>
              </div>
            </div>
          </div>
        </header>
        <main className="px-4 py-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
