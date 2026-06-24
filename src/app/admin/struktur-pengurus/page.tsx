import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { boardMembers } from "@/lib/data";

export default function AdminStrukturPage() {
  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Manajemen Struktur Pengurus" description="Foto pengurus termasuk gambar yang boleh diupload dari admin." />
      <div className="grid gap-6 md:grid-cols-3">
        {boardMembers.map((person) => (
          <Card key={person.id} className="overflow-hidden p-0">
            <img src={person.photoUrl} alt={person.name} className="h-56 w-full object-cover" />
            <div className="p-5">
              <Badge>{person.period}</Badge>
              <h2 className="mt-3 text-xl font-bold text-primary">{person.name}</h2>
              <p className="text-secondary">{person.position}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
