import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { QrCodeCard } from "@/components/admin/qr-code-card";
import { getEvent } from "@/lib/db/events";

export default async function QrAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  return (
    <div className="mx-auto max-w-3xl">
      <AdminPageHeader title="QR Presensi Acara" description="Tampilkan QR ini di layar atau unduh sebagai gambar untuk dicetak." />
      <QrCodeCard token={event.qrToken} title={event.title} />
    </div>
  );
}
