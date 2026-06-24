import { notFound } from "next/navigation";
import { ExportButton } from "@/components/admin/export-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { attendanceRowsForEvent, getEventById } from "@/lib/data";
import { formatDateTimeWIB } from "@/lib/utils";

export default async function PresensiAcaraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const event = getEventById(id);
  if (!event) notFound();
  const rows = attendanceRowsForEvent(event.id);
  const exportRows = rows.map((row) => ({
    acara: event.title,
    no_anggota: row.member.memberNumber,
    nama: row.member.fullName,
    nik: row.member.nik,
    status: row.status,
    waktu_hadir: row.attendance ? formatDateTimeWIB(row.attendance.attendedAt) : ""
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
              {rows.map((row) => (
                <tr key={row.member.id}>
                  <td className="px-5 py-4 font-bold text-primary">{row.member.memberNumber}</td>
                  <td className="px-5 py-4 font-bold">{row.member.fullName}</td>
                  <td className="px-5 py-4">{row.member.nik}</td>
                  <td className="px-5 py-4">
                    <Badge tone={row.attendance ? "success" : "warning"}>{row.status}</Badge>
                  </td>
                  <td className="px-5 py-4 text-muted-text">{row.attendance ? formatDateTimeWIB(row.attendance.attendedAt) : "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
