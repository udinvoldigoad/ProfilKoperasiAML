import type { Metadata } from "next";
import { Fragment } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { boardMembers } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { BoardMember } from "@/types";

export const metadata: Metadata = {
  title: "Struktur Keanggotaan",
  description: "Bagan silsilah kepengurusan Koperasi Agro Mulyo Lestari."
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function PersonCard({ person, lead = false }: { person: BoardMember; lead?: boolean }) {
  return (
    <div
      className={cn(
        "w-full max-w-[15rem] rounded-2xl border bg-white p-2.5 text-center shadow-sm sm:p-5",
        lead ? "border-primary-container" : "border-border-subtle"
      )}
    >
      {person.photoUrl ? (
        <img
          src={person.photoUrl}
          alt={person.name}
          className={cn(
            "mx-auto h-11 w-11 rounded-full border-2 object-cover sm:h-16 sm:w-16",
            lead ? "border-primary-container" : "border-secondary-container"
          )}
        />
      ) : (
        <div
          className={cn(
            "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-sm font-extrabold text-white sm:h-16 sm:w-16 sm:text-lg",
            lead ? "bg-primary-container" : "bg-secondary-container"
          )}
        >
          {initials(person.name)}
        </div>
      )}
      <h3 className="mt-1.5 break-words text-xs font-bold leading-tight text-primary sm:mt-3 sm:text-lg">{person.name}</h3>
      <p className="break-words text-[11px] font-bold leading-tight text-secondary sm:text-base">{person.position}</p>
      {person.period ? (
        <p className="mt-1 hidden text-xs font-bold uppercase tracking-wide text-muted-text sm:block">{person.period}</p>
      ) : null}
    </div>
  );
}

/**
 * Org-chart connector between a parent row and the row below it.
 * Each parent card drops a line into one shared horizontal bus, and each child
 * card rises from that same bus — so the lines always join up, for any count.
 */
function ChartConnector({ parentCount, childCount }: { parentCount: number; childCount: number }) {
  const center = (count: number, index: number) => ((index + 0.5) / count) * 100;
  const parents = Array.from({ length: parentCount }, (_, i) => center(parentCount, i));
  const children = Array.from({ length: childCount }, (_, i) => center(childCount, i));
  const points = [...parents, ...children];
  const left = Math.min(...points);
  const right = Math.max(...points);

  return (
    <div className="relative h-8 w-full max-w-4xl sm:h-10" aria-hidden="true">
      {/* Mobile: a single centered trunk (rows may wrap, so a precise bus would not line up). */}
      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary-container/40 sm:hidden" />

      {/* Desktop: precise org-chart bus + parent drops + child risers. */}
      <div
        className="absolute top-1/2 hidden h-px -translate-y-1/2 bg-primary-container/40 sm:block"
        style={{ left: `${left}%`, right: `${100 - right}%` }}
      />
      {parents.map((position, i) => (
        <div
          key={`p-${i}`}
          className="absolute top-0 hidden h-1/2 w-px -translate-x-1/2 bg-primary-container/40 sm:block"
          style={{ left: `${position}%` }}
        />
      ))}
      {children.map((position, i) => (
        <div
          key={`c-${i}`}
          className="absolute bottom-0 hidden h-1/2 w-px -translate-x-1/2 bg-primary-container/40 sm:block"
          style={{ left: `${position}%` }}
        />
      ))}
    </div>
  );
}

export default function StrukturPage() {
  // Hardcoded org chart (edit in src/lib/data.ts → boardMembers).
  const sorted = [...boardMembers].sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder);

  // Group members into chart rows by level (1 = top), preserving sort order within a row.
  const byLevel = new Map<number, BoardMember[]>();
  for (const person of sorted) {
    const level = person.level ?? 2;
    const row = byLevel.get(level) ?? [];
    row.push(person);
    byLevel.set(level, row);
  }
  const rows = [...byLevel.entries()].sort((a, b) => a[0] - b[0]).map(([, members]) => members);

  return (
    <PublicShell>
      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Struktur Keanggotaan"
          title="Silsilah kepengurusan koperasi"
          description="Bagan pengurus Koperasi Agro Mulyo Lestari, dari ketua hingga jajaran pengurus lainnya."
          align="center"
        />

        <div className="mt-10 flex flex-col items-center sm:mt-12">
          {rows.map((members, rowIndex) => {
            // Many cards in one row are cramped on phones — wrap to 2 per line on mobile,
            // but keep them on a single line (org-chart style) from sm upward.
            const wrap = members.length > 2;
            return (
              <Fragment key={rowIndex}>
                <div
                  className={cn(
                    "flex w-full max-w-4xl items-start justify-center",
                    wrap ? "flex-wrap gap-y-4 sm:flex-nowrap sm:gap-y-0" : ""
                  )}
                >
                  {members.map((person) => (
                    <div
                      key={person.id}
                      className={cn(
                        "flex min-w-0 justify-center px-1 sm:flex-1 sm:px-2",
                        wrap ? "basis-1/2" : "flex-1"
                      )}
                    >
                      <PersonCard person={person} lead={rowIndex === 0} />
                    </div>
                  ))}
                </div>
                {/* Connector down to the next row. */}
                {rowIndex < rows.length - 1 ? (
                  <ChartConnector parentCount={members.length} childCount={rows[rowIndex + 1].length} />
                ) : null}
              </Fragment>
            );
          })}

          {rows.length === 0 ? <p className="text-on-surface-variant">Belum ada data pengurus.</p> : null}
        </div>
      </section>
    </PublicShell>
  );
}
