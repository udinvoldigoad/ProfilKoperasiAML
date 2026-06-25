import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { SettingsForm } from "@/components/admin/settings-form";
import { getSiteProfile } from "@/lib/db/settings";

export default async function AdminPengaturanPage() {
  const profile = await getSiteProfile();

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Pengaturan Sistem" description="Identitas koperasi dan kontak yang tampil di footer, halaman pendaftaran, dan login." />
      <Card>
        <SettingsForm
          initial={{
            name: profile.name,
            village: profile.village,
            district: profile.district,
            regency: profile.regency,
            address: profile.address,
            whatsapp: profile.whatsapp,
            email: profile.email,
            operationalHours: profile.operationalHours
          }}
        />
      </Card>
    </div>
  );
}
