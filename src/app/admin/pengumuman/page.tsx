import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { announcements } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default function AdminPengumumanPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Manajemen Pengumuman" description="Kelola judul, isi, kategori, tanggal, dan status sematan pengumuman koperasi." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="text-xl font-bold text-primary">Form Pengumuman</h2>
          <form className="mt-5 grid gap-4">
            <input className="min-h-12 rounded-lg border border-border-subtle px-4" placeholder="Judul pengumuman" />
            <input className="min-h-12 rounded-lg border border-border-subtle px-4" placeholder="Kategori (mis. Kegiatan, Layanan)" />
            <textarea className="min-h-36 rounded-lg border border-border-subtle px-4 py-3" placeholder="Isi pengumuman" />
            <label className="flex items-center gap-2 text-sm font-bold text-primary">
              <input type="checkbox" className="h-4 w-4" />
              Sematkan sebagai pengumuman penting
            </label>
            <button type="button" className="min-h-12 rounded-lg bg-primary-container px-4 text-sm font-bold text-white">
              Simpan Pengumuman
            </button>
          </form>
        </Card>
        <div className="grid gap-4">
          {announcements.map((item) => (
            <Card key={item.id} className={item.pinned ? "border-secondary-container" : undefined}>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{item.category}</Badge>
                {item.pinned ? <Badge tone="secondary">Penting</Badge> : null}
                <span className="text-sm text-muted-text">{formatDateID(item.date)}</span>
              </div>
              <h2 className="mt-2 text-xl font-bold text-primary">{item.title}</h2>
              <p className="mt-2 text-sm text-on-surface-variant">{item.body}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
