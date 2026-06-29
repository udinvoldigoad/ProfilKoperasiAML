import { AdminPageHeader } from "@/components/admin/page-header";
import { GalleryUploadForm } from "@/components/admin/gallery-upload-form";
import { Card } from "@/components/ui/card";
import { listAllGalleryItems } from "@/lib/db/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGaleriPage() {
  const items = await listAllGalleryItems();

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Galeri Publik"
        description="Upload foto kegiatan koperasi dan kelola tampilan dokumentasi publik."
      />
      <Card className="mb-6">
        <GalleryUploadForm />
      </Card>
      <div className="grid gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Card key={`${item.id}-${item.imageUrl}`} className="overflow-hidden p-0">
            <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
            <div className="p-5">
              <p className="text-xs font-bold uppercase text-secondary-container">{item.category}</p>
              <h2 className="mt-2 font-bold text-primary">{item.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-text">{item.description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
