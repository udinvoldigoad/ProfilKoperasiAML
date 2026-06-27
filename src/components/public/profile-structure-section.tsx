import { Fragment } from "react";
import { UserRound } from "lucide-react";
import { SectionHeading } from "@/components/ui/section-heading";
import { boardMembers } from "@/lib/data";
import { cn } from "@/lib/utils";
import type { BoardMember } from "@/types";

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
            "mx-auto flex h-11 w-11 items-center justify-center rounded-full text-white sm:h-16 sm:w-16",
            lead ? "bg-primary-container" : "bg-secondary-container"
          )}
        >
          <UserRound size={lead ? 34 : 30} strokeWidth={2.4} aria-hidden="true" />
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

function ChartConnector({ parentCount, childCount }: { parentCount: number; childCount: number }) {
  const center = (count: number, index: number) => ((index + 0.5) / count) * 100;
  const parents = Array.from({ length: parentCount }, (_, i) => center(parentCount, i));
  const children = Array.from({ length: childCount }, (_, i) => center(childCount, i));
  const points = [...parents, ...children];
  const left = Math.min(...points);
  const right = Math.max(...points);
  const wraps = childCount > 2;
  const lineClass = wraps ? "hidden sm:block" : "block";

  return (
    <div className="relative h-8 w-full max-w-4xl sm:h-10" aria-hidden="true">
      {wraps ? <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary-container/40 sm:hidden" /> : null}

      <div
        className={cn("absolute top-1/2 h-px -translate-y-1/2 bg-primary-container/40", lineClass)}
        style={{ left: `${left}%`, right: `${100 - right}%` }}
      />
      {parents.map((position, i) => (
        <div
          key={`p-${i}`}
          className={cn("absolute top-0 h-1/2 w-px -translate-x-1/2 bg-primary-container/40", lineClass)}
          style={{ left: `${position}%` }}
        />
      ))}
      {children.map((position, i) => (
        <div
          key={`c-${i}`}
          className={cn("absolute bottom-0 h-1/2 w-px -translate-x-1/2 bg-primary-container/40", lineClass)}
          style={{ left: `${position}%` }}
        />
      ))}
    </div>
  );
}

export function ProfileStructureSection() {
  const sorted = [...boardMembers].sort((a, b) => a.level - b.level || a.sortOrder - b.sortOrder);
  const isPengawas = (person: BoardMember) => /pengawas/i.test(person.position);
  const pengawas = sorted.filter(isPengawas);
  const pengurus = sorted.filter((person) => !isPengawas(person));

  const byLevel = new Map<number, BoardMember[]>();
  for (const person of pengurus) {
    const level = person.level ?? 2;
    const row = byLevel.get(level) ?? [];
    row.push(person);
    byLevel.set(level, row);
  }

  const rows = [...byLevel.entries()].sort((a, b) => a[0] - b[0]).map(([, members]) => members);

  return (
    <section id="struktur" className="scroll-mt-24 py-16 sm:py-20">
      <div className="container-page">
        <SectionHeading
          eyebrow="Struktur Keanggotaan"
          title="Silsilah kepengurusan koperasi"
          description="Bagan pengurus Koperasi Agro Mulyo Lestari, dari ketua hingga jajaran pengurus lainnya."
          align="center"
        />

        <div className="mt-10 flex flex-col items-center sm:mt-12">
          {rows.map((members, rowIndex) => {
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
                {rowIndex < rows.length - 1 ? (
                  <ChartConnector parentCount={members.length} childCount={rows[rowIndex + 1].length} />
                ) : null}
              </Fragment>
            );
          })}

          {rows.length === 0 ? <p className="text-on-surface-variant">Belum ada data pengurus.</p> : null}
        </div>

        {pengawas.length > 0 ? (
          <div className="mx-auto mt-14 max-w-4xl border-t border-border-subtle pt-10">
            <p className="text-center text-sm font-bold text-secondary">Pengawas</p>
            <h3 className="mt-1 text-center text-xl font-bold text-primary">Dewan Pengawas Koperasi</h3>
            <div className="mt-6 flex flex-wrap justify-center gap-2 sm:gap-4">
              {pengawas.map((person) => (
                <div key={person.id} className="flex basis-[30%] justify-center lg:basis-[17%]">
                  <PersonCard person={person} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
