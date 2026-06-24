import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { BoardMemberForm } from "@/components/admin/board-member-form";
import { getBoardMember } from "@/lib/db/board-members";

export default async function EditPengurusPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const person = await getBoardMember(id);
  if (!person) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Edit Pengurus" description={person.name} />
      <Card>
        <BoardMemberForm
          mode="edit"
          memberId={person.id}
          initial={{
            name: person.name,
            position: person.position,
            photoUrl: person.photoUrl,
            contact: person.contact ?? "",
            period: person.period ?? "",
            sortOrder: String(person.sortOrder)
          }}
        />
      </Card>
    </div>
  );
}
