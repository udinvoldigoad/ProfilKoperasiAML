"use client";

import { UserRound } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function StructureAvatar({
  src,
  alt,
  lead = false
}: {
  src?: string | null;
  alt: string;
  lead?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageSrc = !failed && src ? src : null;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt={alt}
        onError={() => setFailed(true)}
        className={cn(
          "mx-auto h-11 w-11 rounded-full border-2 object-cover sm:h-16 sm:w-16",
          lead ? "border-primary-container" : "border-secondary-container"
        )}
      />
    );
  }

  return (
    <div
      className={cn(
        "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-white sm:h-16 sm:w-16",
        lead ? "bg-primary-container" : "bg-secondary-container"
      )}
    >
      <UserRound size={lead ? 34 : 30} strokeWidth={2.4} aria-hidden="true" />
    </div>
  );
}
