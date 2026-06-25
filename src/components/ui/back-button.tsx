"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Back link shown above a sub-page title (uses browser history). */
export function BackButton({ label = "Kembali", className }: { label?: string; className?: string }) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() => router.back()}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary hover:underline",
        className
      )}
    >
      <ArrowLeft size={18} aria-hidden="true" />
      {label}
    </button>
  );
}
