import { AdminPageHeader } from "@/components/admin/page-header";
import { GalleryDeleteButton } from "@/components/admin/gallery-delete-button";
import { GalleryUploadForm } from "@/components/admin/gallery-upload-form";
import { Card } from "@/components/ui/card";
import { listAllGalleryItems, listUploadedGalleryItems } from "@/lib/db/gallery";

export const dynamic = "force-dynamic";

export default async function AdminGaleriPage() {
  const [items, uploadedItems] = await Promise.all([listAllGalleryItems(), listUploadedGalleryItems()]);
  const uploadedIds = new Set(uploadedItems.map((item) => item.id));

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Galeri Publik"
        description="Upload foto kegiatan koperasi dan kelola tampilan dokumentasi publik."
      />
      <Card className="mb-6 overflow-hidden p-4 sm:p-6">
        <GalleryUploadForm />
      </Card>
      <div className="grid min-w-0 gap-6 md:grid-cols-3">
        {items.map((item) => (
          <Card key={`${item.id}-${item.imageUrl}`} className="overflow-hidden p-0">
            <img src={item.imageUrl} alt={item.title} className="h-52 w-full object-cover" />
            <div className="p-5">
              <p className="text-xs font-bold uppercase text-secondary-container">{item.category}</p>
              <h2 className="mt-2 font-bold text-primary">{item.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-muted-text">{item.description}</p>
              <div className="mt-4">
                {uploadedIds.has(item.id) ? (
                  <GalleryDeleteButton id={item.id} title={item.title} />
                ) : (
                  <span className="inline-flex min-h-10 items-center rounded-lg border border-border-subtle bg-surface-gray px-3 text-xs font-bold text-muted-text">
                    Foto awal
                  </span>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
