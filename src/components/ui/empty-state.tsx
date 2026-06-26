import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

/** Friendly placeholder shown when a list/section has no data yet. */
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-subtle bg-surface-gray px-6 py-12 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-container-low text-primary">
        <Icon size={26} aria-hidden="true" />
      </span>
      <h3 className="mt-4 text-lg font-bold text-primary">{title}</h3>
      {description ? <p className="mt-1 max-w-sm text-sm text-on-surface-variant">{description}</p> : null}
    </div>
  );
}
