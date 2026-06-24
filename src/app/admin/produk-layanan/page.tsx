import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { products } from "@/lib/data";

export default function AdminProdukPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Manajemen Produk Layanan" description="Kelola informasi layanan. Tidak ada transaksi keuangan pada versi ini." />
      <div className="grid gap-6 md:grid-cols-3">
        {products.map((product) => (
          <Card key={product.id}>
            <Badge tone="secondary">{product.category}</Badge>
            <h2 className="mt-4 text-xl font-bold text-primary">{product.title}</h2>
            <p className="mt-3 text-sm text-on-surface-variant">{product.description}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
