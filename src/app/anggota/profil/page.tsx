import { Card } from "@/components/ui/card";
import { ProfilForm } from "@/components/anggota/profil-form";
import { getSessionUser } from "@/lib/auth";
import { getMemberForSession } from "@/lib/db/members";

export default async function ProfilAnggotaPage() {
  const session = await getSessionUser();
  const member = session?.member ? await getMemberForSession(session.member.id) : null;

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Profil Saya</h1>
        <p className="mt-2 text-on-surface-variant">Perbarui data pribadi Anda. No Anggota dan NIK hanya bisa diubah oleh admin.</p>
      </div>

      {member ? (
        <ProfilForm
          initial={{
            fullName: member.fullName,
            birthPlace: member.birthPlace,
            birthDate: member.birthDate,
            address: member.address,
            phone: member.phone ?? ""
          }}
          info={{
            memberNumber: member.memberNumber,
            nik: member.nik,
            status: member.status
          }}
        />
      ) : (
        <Card>
          <p className="text-on-surface-variant">Data anggota tidak ditemukan untuk akun ini. Hubungi admin koperasi.</p>
        </Card>
      )}
    </div>
  );
}
