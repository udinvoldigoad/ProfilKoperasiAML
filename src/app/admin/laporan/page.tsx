import { ExportButton } from "@/components/admin/export-button";
import { PdfReportButton } from "@/components/admin/pdf-report-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { listMembers } from "@/lib/db/members";
import { getEventAttendanceRows, listEvents } from "@/lib/db/events";
import { getSiteProfile } from "@/lib/db/settings";
import { formatDateID, formatDateTimeWIB } from "@/lib/utils";

export default async function AdminLaporanPage() {
  const [members, events, profile] = await Promise.all([listMembers(), listEvents(), getSiteProfile()]);

  const memberRows = members.map((member) => ({
    no_anggota: member.memberNumber,
    nama: member.fullName,
    nik: member.nik,
    alamat: member.address,
    status: member.status,
    tipe: member.memberType
  }));

  const eventReports = await Promise.all(
    events.map(async (event) => {
      const rows = await getEventAttendanceRows(event.id);
      const present = rows.filter((row) => row.attendedAt).length;
      return {
        event,
        present,
        total: rows.length,
        excelRows: rows.map((row) => ({
          acara: event.title,
          tanggal: event.date,
          no_anggota: row.memberNumber,
          nama: row.fullName,
          nik: row.nik,
          status: row.attendedAt ? "Hadir" : "Tidak Hadir",
          waktu_hadir: row.attendedAt ? formatDateTimeWIB(row.attendedAt) : ""
        }))
      };
    })
  );

  const pdfData = {
    koperasiName: profile.name,
    summary: {
      total: members.length,
      aktif: members.filter((member) => member.status === "aktif").length,
      acara: events.length
    },
    members: members.map((member) => ({ no: member.memberNumber, nama: member.fullName, status: member.status })),
    events: eventReports.map(({ event, present, total }) => ({
      acara: event.title,
      tanggal: event.date,
      hadir: present,
      total
    }))
  };

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Laporan dan Export" description="Export data anggota dan rekap presensi dalam format Excel atau PDF." />

      <Card className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-xl font-bold text-primary">Laporan Ringkas (PDF)</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            Satu dokumen berisi ringkasan anggota, daftar anggota, dan rekap presensi tiap acara.
          </p>
        </div>
        <PdfReportButton data={pdfData} />
      </Card>

      <Card className="mb-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
        <div>
          <h2 className="text-xl font-bold text-primary">Data Anggota</h2>
          <p className="mt-2 text-sm text-on-surface-variant">
            {members.length} anggota - Excel berisi no anggota, nama, NIK, alamat, status, dan tipe.
          </p>
        </div>
        <ExportButton filename="anggota-aml.xlsx" rows={memberRows} label="Export Anggota" />
      </Card>

      <h2 className="mb-3 text-lg font-bold text-primary">Rekap Presensi per Acara</h2>
      <div className="grid gap-4">
        {eventReports.length > 0 ? (
          eventReports.map(({ event, present, total, excelRows }) => (
            <Card key={event.id} className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
              <div>
                <h3 className="text-lg font-bold text-primary">{event.title}</h3>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {formatDateID(event.date)} - {present}/{total} hadir
                </p>
              </div>
              <ExportButton filename={`presensi-${event.date}-${event.id}.xlsx`} rows={excelRows} label="Export Presensi" />
            </Card>
          ))
        ) : (
          <Card>
            <p className="text-on-surface-variant">Belum ada acara untuk direkap.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
