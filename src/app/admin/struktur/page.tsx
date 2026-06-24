import Link from "next/link";
import { UserPlus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/page-header";
import { BoardMemberActions } from "@/components/admin/board-member-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listBoardMembers } from "@/lib/db/board-members";

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default async function AdminStrukturPage() {
  const people = await listBoardMembers();

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Manajemen Struktur Keanggotaan"
        description="Kelola jajaran pengurus koperasi: nama, jabatan, periode, dan urutan tampil."
        actions={
          <Link className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white" href="/admin/struktur/tambah">
            <UserPlus size={18} aria-hidden="true" />
            Tambah Pengurus
          </Link>
        }
      />
      <div className="grid gap-5">
        {people.length > 0 ? (
          people.map((person) => (
            <Card key={person.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-4">
                {person.photoUrl ? (
                  <img src={person.photoUrl} alt={person.name} className="h-16 w-16 shrink-0 rounded-full object-cover" />
                ) : (
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-secondary-container text-lg font-extrabold text-white">
                    {initials(person.name)}
                  </span>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <Badge tone="neutral">#{person.sortOrder}</Badge>
                    {person.period ? <Badge>{person.period}</Badge> : null}
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-primary">{person.name}</h2>
                  <p className="text-secondary">{person.position}</p>
                </div>
              </div>
              <BoardMemberActions memberId={person.id} name={person.name} />
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-on-surface-variant">Belum ada pengurus. Klik <strong>Tambah Pengurus</strong> untuk menambahkan.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
