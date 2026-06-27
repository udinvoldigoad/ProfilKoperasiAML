"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";

// Top-level admin menu pages — these do NOT get a back button.
const TOP_LEVEL = new Set<string>([
  "/admin",
  "/admin/dashboard",
  "/admin/anggota",
  "/admin/acara",
  "/admin/pengumuman",
  "/admin/laporan",
  "/admin/audit-log",
  "/admin/pengaturan"
]);

export function AdminPageHeader({
  title,
  description,
  actions
}: {
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSubPage = !TOP_LEVEL.has(pathname);

  return (
    <div className="mb-6">
      {isSubPage ? <BackButton className="mb-3" /> : null}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-primary">{title}</h1>
          <p className="mt-2 max-w-3xl text-on-surface-variant">{description}</p>
        </div>
        {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
      </div>
    </div>
  );
}
