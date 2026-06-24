import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { siteProfile } from "@/lib/data";

export default function AdminPengaturanPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Pengaturan Sistem" description="Pengaturan identitas koperasi, kontak, dan format no anggota." />
      <Card>
        <form className="grid gap-5 md:grid-cols-2">
          {[
            ["Nama Koperasi", siteProfile.name],
            ["Nama Desa", siteProfile.village],
            ["Kecamatan", siteProfile.district],
            ["Kabupaten", siteProfile.regency],
            ["WhatsApp Admin", siteProfile.whatsapp],
            ["Email", siteProfile.email],
            ["Format No Anggota", "AML-YYYY-XXXX"],
            ["Jam Operasional", siteProfile.operationalHours]
          ].map(([label, value]) => (
            <label key={label} className="grid gap-2 text-sm font-bold text-primary">
              {label}
              <input className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface" defaultValue={value} />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
            Alamat
            <textarea className="min-h-28 rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface" defaultValue={siteProfile.address} />
          </label>
          <div className="md:col-span-2">
            <button type="button" className="min-h-12 rounded-lg bg-primary-container px-5 text-sm font-bold text-white">
              Simpan Pengaturan Demo
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
