import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { MemberActions } from "@/components/admin/member-actions";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMember } from "@/lib/db/members";
import { formatDateID } from "@/lib/utils";

export default async function DetailAnggotaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const member = await getMember(id);
  if (!member) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader
        title={member.fullName}
        description="Detail anggota, soft delete, dan reset password manual sesuai PRD."
        actions={<MemberActions memberId={member.id} />}
      />
      <Card>
        <div className="grid gap-5 md:grid-cols-2">
          {[
            ["No Anggota", member.memberNumber],
            ["NIK", member.nik],
            ["Tempat Lahir", member.birthPlace],
            ["Tanggal Lahir", formatDateID(member.birthDate)],
            ["Alamat", member.address],
            ["No HP", member.phone || "-"],
            ["Email", member.email || "-"],
            ["Tipe", member.memberType === "anggota_baru" ? "Anggota Baru" : "Anggota Lama"]
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-surface-gray p-4">
              <p className="text-sm font-bold text-muted-text">{label}</p>
              <p className="mt-1 font-bold text-primary">{value}</p>
            </div>
          ))}
        </div>
        <div className="mt-5">
          <Badge tone={member.status === "aktif" ? "success" : "warning"}>{member.status}</Badge>
        </div>
      </Card>
    </div>
  );
}
