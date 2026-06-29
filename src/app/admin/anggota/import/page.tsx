import { AdminPageHeader } from "@/components/admin/page-header";
import { MemberImport } from "@/components/admin/member-import";

export default function ImportAnggotaPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Import Anggota dari Excel"
        description="Baris highlight kuning dideteksi sebagai anggota lama, tanpa highlight sebagai anggota baru. Setiap baris valid dibuatkan akun login (password awal = NIK)."
      />
      <MemberImport />
    </div>
  );
}
