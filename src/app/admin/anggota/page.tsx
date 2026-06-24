import Link from "next/link";
import { FileUp, UserPlus } from "lucide-react";
import { AnggotaTable } from "@/components/admin/anggota-table";
import { ExportButton } from "@/components/admin/export-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { listMembers } from "@/lib/db/members";

export default async function AdminAnggotaPage() {
  const members = await listMembers();
  const exportRows = members.map((member) => ({
    no_anggota: member.memberNumber,
    nama: member.fullName,
    nik: member.nik,
    tempat_lahir: member.birthPlace,
    tanggal_lahir: member.birthDate,
    alamat: member.address,
    status: member.status,
    tipe: member.memberType
  }));

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Manajemen Anggota"
        description="Kelola anggota, validasi NIK 16 digit, filter tipe anggota, import Excel, reset password, dan export data."
        actions={
          <div className="grid w-full grid-cols-3 gap-3">
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary" href="/admin/anggota/import">
              <FileUp size={18} aria-hidden="true" className="shrink-0" />
              Import Excel
            </Link>
            <ExportButton filename="anggota-koperasi-aml.csv" rows={exportRows} />
            <Link className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-primary-container px-4 text-sm font-bold text-white" href="/admin/anggota/tambah">
              <UserPlus size={18} aria-hidden="true" className="shrink-0" />
              Tambah Anggota
            </Link>
          </div>
        }
      />

      <AnggotaTable members={members} />
    </div>
  );
}
