import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = ComponentPropsWithoutRef<typeof Link> & {
  variant?: "primary" | "secondary" | "ghost";
};

export function ButtonLink({ className, variant = "primary", ...props }: ButtonLinkProps) {
  return (
    <Link
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition",
        variant === "primary" && "bg-primary-container text-white hover:bg-teal-dark",
        variant === "secondary" && "border border-primary-container bg-white text-primary-container hover:bg-surface-container-low",
        variant === "ghost" && "text-primary-container hover:bg-surface-container-low",
        className
      )}
      {...props}
    />
  );
}
