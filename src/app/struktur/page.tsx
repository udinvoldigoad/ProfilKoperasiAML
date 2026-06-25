import type { Metadata } from "next";
import { Fragment } from "react";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { boardMembers } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { BoardMember } from "@/types";

export const metadata: Metadata = {
  title: "Struktur Keanggotaan",
  description: "Bagan silsilah kepengurusan Koperasi Agri Mulyo Lestari."
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
      {/* Shared horizontal bus at mid-height. */}
      <div
        className="absolute top-1/2 h-px -translate-y-1/2 bg-primary-container/40"
        style={{ left: `${left}%`, right: `${100 - right}%` }}
      />
      {/* Parent drops (top half). */}
      {parents.map((position, i) => (
        <div
          key={`p-${i}`}
          className="absolute top-0 h-1/2 w-px -translate-x-1/2 bg-primary-container/40"
          style={{ left: `${position}%` }}
        />
      ))}
      {/* Child risers (bottom half). */}
      {children.map((position, i) => (
        <div
          key={`c-${i}`}
          className="absolute bottom-0 h-1/2 w-px -translate-x-1/2 bg-primary-container/40"
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
          description="Bagan pengurus Koperasi Agri Mulyo Lestari, dari ketua hingga jajaran pengurus lainnya."
          align="center"
        />

        <div className="mt-10 flex flex-col items-center sm:mt-12">
          {rows.map((members, rowIndex) => (
            <Fragment key={rowIndex}>
              {/* Cards row (horizontal on every screen size; cards shrink on mobile). */}
              <div className="flex w-full max-w-4xl items-start justify-center">
                {members.map((person) => (
                  <div key={person.id} className="flex min-w-0 flex-1 justify-center px-0.5 sm:px-2">
                    <PersonCard person={person} lead={rowIndex === 0} />
                  </div>
                ))}
              </div>
              {/* Connector down to the next row. */}
              {rowIndex < rows.length - 1 ? (
                <ChartConnector parentCount={members.length} childCount={rows[rowIndex + 1].length} />
              ) : null}
            </Fragment>
          ))}

          {rows.length === 0 ? <p className="text-on-surface-variant">Belum ada data pengurus.</p> : null}
        </div>
      </section>
    </PublicShell>
  );
}
