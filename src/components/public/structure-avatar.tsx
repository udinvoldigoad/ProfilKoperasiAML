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
  const [loaded, setLoaded] = useState(false);
  const imageSrc = !failed && src ? src : null;

  return (
    <div className="relative mx-auto h-11 w-11 sm:h-16 sm:w-16">
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center rounded-full text-white",
          lead ? "bg-primary-container" : "bg-secondary-container"
        )}
      >
        <UserRound size={lead ? 34 : 30} strokeWidth={2.4} aria-hidden="true" />
      </div>
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={alt}
          onLoad={() => setLoaded(true)}
          onError={() => {
            setFailed(true);
            setLoaded(false);
          }}
          className={cn(
            "absolute inset-0 h-full w-full rounded-full border-2 object-cover transition-opacity",
            loaded ? "opacity-100" : "opacity-0",
            lead ? "border-primary-container" : "border-secondary-container"
          )}
        />
      ) : null}
    </div>
  );
}
