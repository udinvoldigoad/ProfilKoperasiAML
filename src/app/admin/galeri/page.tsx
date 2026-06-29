import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { galleryItems } from "@/lib/data";

export default function AdminGaleriPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Galeri Publik"
        description="Galeri publik memakai aset gambar yang tersimpan di project agar ringan dan konsisten."
      />
      <Card className="mb-6">
        <p className="text-on-surface-variant">
          Upload gambar dinamis dibatasi untuk struktur kepengurusan, acara, dan berita. Galeri ini mengambil gambar dari folder public/images.
        </p>
      </Card>
      <div className="grid gap-6 md:grid-cols-3">
        {galleryItems.map((item) => (
          <Card key={item.id} className="overflow-hidden p-0">
            <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
            <div className="p-5">
              <h2 className="font-bold text-primary">{item.title}</h2>
              <p className="mt-2 text-sm text-muted-text">{item.category}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
