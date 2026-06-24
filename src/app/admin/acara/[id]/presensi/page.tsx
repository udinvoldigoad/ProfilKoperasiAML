import { notFound } from "next/navigation";
import { ExportButton } from "@/components/admin/export-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getEvent, getEventAttendanceRows } from "@/lib/db/events";
import { formatDateTimeWIB } from "@/lib/utils";

export default async function PresensiAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = await getEvent(id);
  if (!event) notFound();
  const rows = await getEventAttendanceRows(event.id);
  const exportRows = rows.map((row) => ({
    acara: event.title,
    no_anggota: row.memberNumber,
    nama: row.fullName,
    nik: row.nik,
    status: row.attendedAt ? "Hadir" : "Tidak Hadir",
    waktu_hadir: row.attendedAt ? formatDateTimeWIB(row.attendedAt) : ""
  }));

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader
        title="Rekap Presensi"
        description={event.title}
        actions={<ExportButton filename={`presensi-${event.id}.csv`} rows={exportRows} />}
      />
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto table-scroll">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-5 py-4">No Anggota</th>
                <th className="px-5 py-4">Nama</th>
                <th className="px-5 py-4">NIK</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Waktu Hadir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.length > 0 ? (
                rows.map((row) => (
                  <tr key={row.memberId}>
                    <td className="px-5 py-4 font-bold text-primary">{row.memberNumber}</td>
                    <td className="px-5 py-4 font-bold">{row.fullName}</td>
                    <td className="px-5 py-4">{row.nik}</td>
                    <td className="px-5 py-4">
                      <Badge tone={row.attendedAt ? "success" : "warning"}>{row.attendedAt ? "Hadir" : "Tidak Hadir"}</Badge>
                    </td>
                    <td className="px-5 py-4 text-muted-text">{row.attendedAt ? formatDateTimeWIB(row.attendedAt) : "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">
                    Belum ada anggota aktif untuk acara ini.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
