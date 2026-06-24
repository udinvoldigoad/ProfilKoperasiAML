import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MemberForm } from "@/components/admin/member-form";
import { Card } from "@/components/ui/card";
import { getMember } from "@/lib/db/members";

export default async function EditAnggotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title={`Edit ${member.fullName}`}
        description="Ubah data anggota. NIK dan No Anggota tidak dapat diubah karena terkait akun login."
      />
      <Card>
        <MemberForm
          mode="edit"
          memberId={member.id}
          initial={{
            memberNumber: member.memberNumber,
            fullName: member.fullName,
            nik: member.nik,
            birthPlace: member.birthPlace,
            birthDate: member.birthDate,
            address: member.address,
            email: member.email ?? "",
            phone: member.phone ?? "",
            memberType: member.memberType,
            status: member.status
          }}
        />
      </Card>
    </div>
  );
}
