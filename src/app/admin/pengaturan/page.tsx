import { AdminPageHeader } from "@/components/admin/page-header";
import { AdminPasswordResetForm } from "@/components/admin/admin-password-reset-form";
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
      <Card className="mt-6">
        <div className="mb-5">
          <h2 className="text-xl font-bold text-primary">Reset Password Admin</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Ganti password akun admin yang sedang digunakan untuk login.
          </p>
        </div>
        <AdminPasswordResetForm />
      </Card>
    </div>
  );
}
