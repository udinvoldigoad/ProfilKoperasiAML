import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { BoardMemberForm } from "@/components/admin/board-member-form";

export default function TambahPengurusPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Tambah Pengurus" description="Tambahkan pengurus baru ke bagan struktur keanggotaan koperasi." />
      <Card>
        <BoardMemberForm mode="create" />
      </Card>
    </div>
  );
}
