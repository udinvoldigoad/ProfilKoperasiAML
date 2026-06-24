import type { Metadata } from "next";
import { PublicShell } from "@/components/public/public-shell";
import { SectionHeading } from "@/components/ui/section-heading";
import { listBoardMembers } from "@/lib/db/board-members";
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
        "w-full max-w-[15rem] rounded-2xl border bg-white p-5 text-center shadow-sm",
        lead ? "border-primary-container" : "border-border-subtle"
      )}
    >
      <div
        className={cn(
          "mx-auto flex h-16 w-16 items-center justify-center rounded-full text-lg font-extrabold text-white",
          lead ? "bg-primary-container" : "bg-secondary-container"
        )}
      >
        {initials(person.name)}
      </div>
      <h3 className="mt-3 text-lg font-bold text-primary">{person.name}</h3>
      <p className="font-bold text-secondary">{person.position}</p>
      {person.period ? <p className="mt-1 text-xs font-bold uppercase tracking-wide text-muted-text">{person.period}</p> : null}
    </div>
  );
}

export default async function StrukturPage() {
  const sorted = await listBoardMembers();
  const [lead, ...rest] = sorted;

  return (
    <PublicShell>
      <section className="container-page py-12 sm:py-16">
        <SectionHeading
          eyebrow="Struktur Keanggotaan"
          title="Silsilah kepengurusan koperasi"
          description="Bagan pengurus Koperasi Agri Mulyo Lestari, dari ketua hingga jajaran pengurus lainnya."
          align="center"
        />

        <div className="mt-12 flex flex-col items-center">
          {lead ? <PersonCard person={lead} lead /> : null}

          {rest.length > 0 ? (
            <>
              <div className="h-10 w-px bg-primary-container/40" />
              <div className="flex w-full max-w-4xl flex-col items-center md:flex-row md:items-start md:justify-center">
                {rest.map((person, index) => (
                  <div key={person.id} className="flex w-full flex-col items-center md:flex-1">
                    {/* Desktop connectors: a shared horizontal line + a vertical drop per card. */}
                    <div className="relative hidden h-10 w-full md:block">
                      <div
                        className={cn(
                          "absolute top-0 h-px bg-primary-container/40",
                          rest.length === 1
                            ? "hidden"
                            : index === 0
                              ? "left-1/2 right-0"
                              : index === rest.length - 1
                                ? "left-0 right-1/2"
                                : "left-0 right-0"
                        )}
                      />
                      <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-primary-container/40" />
                    </div>
                    {/* Mobile connector */}
                    <div className="h-6 w-px bg-primary-container/40 md:hidden" />
                    <div className="flex w-full justify-center px-2">
                      <PersonCard person={person} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : null}
        </div>
      </section>
    </PublicShell>
  );
}
