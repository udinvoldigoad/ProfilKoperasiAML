import { AttendanceHistoryList } from "@/components/anggota/attendance-history-list";
import { getSessionUser } from "@/lib/auth";
import { listMemberAttendances } from "@/lib/db/attendances";

export default async function RiwayatKehadiranPage() {
  const session = await getSessionUser();
  const rows = session?.member ? await listMemberAttendances(session.member.id) : [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Riwayat Kehadiran</h1>
        <p className="mt-2 text-on-surface-variant">Data kehadiran pribadi anggota.</p>
      </div>

      <AttendanceHistoryList rows={rows} />
    </div>
  );
}
