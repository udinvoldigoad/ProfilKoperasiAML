import { notFound } from "next/navigation";
import { ExportButton } from "@/components/admin/export-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getEvent, getEventAttendanceRows } from "@/lib/db/events";
import type { EventAttendanceRow } from "@/lib/db/events";
import { formatDateTimeWIB } from "@/lib/utils";

function PresensiTable({
  title,
  description,
  rows,
  mode
}: {
  title: string;
  description: string;
  rows: EventAttendanceRow[];
  mode: "hadir" | "tidak_hadir";
}) {
  const isPresent = mode === "hadir";

  return (
    <Card className="overflow-hidden p-0">
      <div className="flex flex-col gap-2 border-b border-border-subtle px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-primary">{title}</h2>
          <p className="text-sm text-on-surface-variant">{description}</p>
        </div>
        <Badge tone={isPresent ? "success" : "warning"}>{rows.length} {isPresent ? "peserta" : "anggota"}</Badge>
      </div>
      <div className="overflow-x-auto table-scroll">
        <table className="w-full min-w-[820px] text-left">
          <thead className="bg-surface-gray text-sm text-on-surface-variant">
            <tr>
              <th className="px-5 py-4">Jenis</th>
              <th className="px-5 py-4">No Anggota</th>
              <th className="px-5 py-4">Nama</th>
              <th className="px-5 py-4">NIK / No HP</th>
              <th className="px-5 py-4">Status</th>
              {isPresent ? <th className="px-5 py-4">Waktu Hadir</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={`${row.attendeeType}-${row.attendeeId}`}>
                  <td className="px-5 py-4">
                    <Badge tone={row.attendeeType === "tamu" ? "secondary" : "success"}>{row.attendeeType === "tamu" ? "Tamu" : "Anggota"}</Badge>
                  </td>
                  <td className="px-5 py-4 font-bold text-primary">{row.memberNumber}</td>
                  <td className="px-5 py-4 font-bold">{row.fullName}</td>
                  <td className="px-5 py-4">{row.attendeeType === "tamu" ? row.phone : row.nik}</td>
                  <td className="px-5 py-4">
                    <Badge tone={isPresent ? "success" : "warning"}>{isPresent ? "Hadir" : "Tidak Hadir"}</Badge>
                  </td>
                  {isPresent ? <td className="px-5 py-4 text-muted-text">{row.attendedAt ? formatDateTimeWIB(row.attendedAt) : "-"}</td> : null}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={isPresent ? 6 : 5} className="px-5 py-8 text-center text-on-surface-variant">
                  {isPresent ? "Belum ada peserta yang hadir." : "Semua anggota aktif sudah tercatat hadir."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default async function PresensiAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const rows = await getEventAttendanceRows(event.id);
  const presentRows = rows.filter((row) => Boolean(row.attendedAt));
  const absentRows = rows.filter((row) => row.attendeeType === "anggota" && !row.attendedAt);
  const exportRows = rows.map((row) => ({
    acara: event.title,
    jenis: row.attendeeType === "tamu" ? "Tamu" : "Anggota",
    no_anggota: row.memberNumber,
    nama: row.fullName,
    nik_no_hp: row.attendeeType === "tamu" ? row.phone : row.nik,
    status: row.attendedAt ? "Hadir" : "Tidak Hadir",
    waktu_hadir: row.attendedAt ? formatDateTimeWIB(row.attendedAt) : ""
  }));

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Rekap Presensi"
        description={event.title}
        actions={<ExportButton filename={`presensi-${event.id}.xlsx`} rows={exportRows} />}
      />
      <div className="grid gap-6">
        <PresensiTable
          title="Daftar Peserta Hadir"
          description="Anggota dan tamu yang sudah tercatat presensi pada acara ini."
          rows={presentRows}
          mode="hadir"
        />
        <PresensiTable
          title="Daftar Anggota Tidak Hadir"
          description="Anggota aktif yang belum memiliki catatan presensi untuk acara ini."
          rows={absentRows}
          mode="tidak_hadir"
        />
      </div>
    </div>
  );
}
