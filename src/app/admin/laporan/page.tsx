import { ExportButton } from "@/components/admin/export-button";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { attendanceRowsForEvent, events, members } from "@/lib/data";
import { formatDateTimeWIB } from "@/lib/utils";

export default function AdminLaporanPage() {
  const memberRows = members.map((member) => ({
    no_anggota: member.memberNumber,
    nama: member.fullName,
    nik: member.nik,
    alamat: member.address,
    status: member.status,
    tipe: member.memberType
  }));
  const event = events[2];
  const attendanceRows = attendanceRowsForEvent(event.id).map((row) => ({
    acara: event.title,
    no_anggota: row.member.memberNumber,
    nama: row.member.fullName,
    status: row.status,
    waktu_hadir: row.attendance ? formatDateTimeWIB(row.attendance.attendedAt) : ""
  }));

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Laporan dan Export" description="Export data anggota, rekap presensi per acara, dan rancangan laporan bulanan." />
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <h2 className="text-xl font-bold text-primary">Data Anggota</h2>
          <p className="mt-2 text-sm text-on-surface-variant">CSV berisi no anggota, nama, NIK, alamat, status, dan tipe.</p>
          <div className="mt-5">
            <ExportButton filename="anggota-aml.csv" rows={memberRows} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-primary">Rekap Presensi</h2>
          <p className="mt-2 text-sm text-on-surface-variant">Status hadir/tidak hadir diturunkan dari daftar anggota aktif.</p>
          <div className="mt-5">
            <ExportButton filename="presensi-demo-aml.csv" rows={attendanceRows} />
          </div>
        </Card>
        <Card>
          <h2 className="text-xl font-bold text-primary">Laporan Bulanan</h2>
          <p className="mt-2 text-sm text-on-surface-variant">PDF/XLSX disiapkan sebagai extension berikutnya setelah Supabase tersambung.</p>
          <button className="mt-5 min-h-11 rounded-lg border border-primary-container bg-white px-4 text-sm font-bold text-primary">
            Siapkan PDF
          </button>
        </Card>
      </div>
    </div>
  );
}
