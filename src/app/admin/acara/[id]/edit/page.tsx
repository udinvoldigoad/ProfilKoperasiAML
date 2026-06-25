import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/admin/event-form";
import { EventCancelButton } from "@/components/admin/event-cancel-button";
import { getEvent } from "@/lib/db/events";

export default async function EditAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  // Finished events are locked from editing (a cancelled event stays editable so it can be reinstated).
  if (event.status === "selesai") redirect(`/admin/acara/${event.id}`);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminPageHeader title="Edit Acara" description={event.title} />
      <Card>
        <EventForm
          mode="edit"
          eventId={event.id}
          initial={{
            title: event.title,
            date: event.date,
            startTime: event.startTime,
            endTime: event.endTime,
            location: event.location,
            description: event.description,
            status: event.status
          }}
        />
      </Card>
      <Card className="mt-6">
        <h2 className="text-lg font-bold text-primary">Pembatalan Acara</h2>
        <p className="mt-1 text-sm text-on-surface-variant">
          Acara yang dibatalkan tidak mengikuti jadwal otomatis dan QR presensinya tidak aktif.
        </p>
        <div className="mt-4">
          <EventCancelButton eventId={event.id} cancelled={event.status === "dibatalkan"} />
        </div>
      </Card>
    </div>
  );
}
