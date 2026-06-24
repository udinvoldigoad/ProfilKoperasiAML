import { notFound, redirect } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { EventForm } from "@/components/admin/event-form";
import { getEvent } from "@/lib/db/events";

export default async function EditAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  // Finished events are locked from editing.
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
    </div>
  );
}
