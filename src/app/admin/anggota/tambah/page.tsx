import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { MemberForm } from "@/components/admin/member-form";

export default function TambahAnggotaPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title="Tambah Anggota"
        description="Submit akan membuat profile, member, dan akun auth anggota di Supabase. Password awal anggota = NIK."
      />
      <Card>
        <MemberForm />
      </Card>
    </div>
  );
}
