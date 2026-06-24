import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { posts } from "@/lib/data";
import { formatDateID } from "@/lib/utils";

export default function AdminBeritaPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Manajemen Berita" description="Kelola judul, slug, isi, tanggal publikasi, status, dan thumbnail berita." />
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card>
          <h2 className="text-xl font-bold text-primary">Form Berita</h2>
          <form className="mt-5 grid gap-4">
            <input className="min-h-12 rounded-lg border border-border-subtle px-4" placeholder="Judul berita" />
            <input className="min-h-12 rounded-lg border border-border-subtle px-4" placeholder="Slug otomatis" />
            <input type="file" accept="image/png,image/jpeg,image/webp" className="rounded-lg border border-dashed border-primary-container bg-surface-gray p-3" />
            <textarea className="min-h-36 rounded-lg border border-border-subtle px-4 py-3" placeholder="Isi berita" />
            <button type="button" className="min-h-12 rounded-lg bg-primary-container px-4 text-sm font-bold text-white">
              Simpan Draft
            </button>
          </form>
        </Card>
        <div className="grid gap-4">
          {posts.map((post) => (
            <Card key={post.id} className="grid gap-4 md:grid-cols-[160px_1fr]">
              <img src={post.thumbnailUrl} alt={post.title} className="h-40 w-full rounded-2xl object-cover" />
              <div>
                <Badge>{post.status}</Badge>
                <h2 className="mt-3 text-xl font-bold text-primary">{post.title}</h2>
                <p className="text-sm text-muted-text">{formatDateID(post.publishedAt)}</p>
                <p className="mt-2 text-sm text-on-surface-variant">{post.excerpt}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
