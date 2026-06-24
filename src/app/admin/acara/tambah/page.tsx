import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";

export default function TambahAcaraPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Buat Acara" description="Tanggal dan jam acara disimpan dengan validasi UTC/WIB di server ketika Supabase aktif." />
      <Card>
        <form className="grid gap-5 md:grid-cols-2">
          {[
            ["Judul Acara", "Rapat Anggota"],
            ["Tanggal", "2026-07-02"],
            ["Jam Mulai", "08:30"],
            ["Jam Selesai", "11:30"],
            ["Lokasi", "Balai Desa"],
            ["Status", "draft"]
          ].map(([label, placeholder]) => (
            <label key={label} className="grid gap-2 text-sm font-bold text-primary">
              {label}
              <input className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface" placeholder={placeholder} />
            </label>
          ))}
          <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
            Deskripsi
            <textarea className="min-h-32 rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface" placeholder="Deskripsi acara" />
          </label>
          <div className="md:col-span-2">
            <button type="button" className="min-h-12 rounded-lg bg-primary-container px-5 text-sm font-bold text-white">
              Simpan Acara Demo
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
}
