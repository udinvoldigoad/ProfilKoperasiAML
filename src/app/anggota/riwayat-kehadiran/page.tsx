import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { listMemberAttendances } from "@/lib/db/attendances";
import { formatDateID, formatDateTimeWIB } from "@/lib/utils";

export default async function RiwayatKehadiranPage() {
  const session = await getSessionUser();
  const rows = session?.member ? await listMemberAttendances(session.member.id) : [];

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-extrabold text-primary sm:text-3xl">Riwayat Kehadiran</h1>
        <p className="mt-2 text-on-surface-variant">Data kehadiran pribadi anggota.</p>
      </div>

      {/* Mobile: stacked cards (no horizontal scroll on phones). */}
      <div className="grid gap-3 md:hidden">
        {rows.length > 0 ? (
          rows.map((attendance) => (
            <Card key={attendance.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-primary">{attendance.eventTitle}</p>
                <Badge tone={attendance.method === "qr_code" ? "success" : "secondary"}>
                  {attendance.method === "qr_code" ? "QR Code" : "Manual"}
                </Badge>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="font-bold text-muted-text">Tanggal</dt>
                  <dd className="mt-0.5 text-on-surface">{attendance.eventDate ? formatDateID(attendance.eventDate) : "-"}</dd>
                </div>
                <div>
                  <dt className="font-bold text-muted-text">Waktu Hadir</dt>
                  <dd className="mt-0.5 text-on-surface">{formatDateTimeWIB(attendance.attendedAt)}</dd>
                </div>
              </dl>
            </Card>
          ))
        ) : (
          <Card className="p-4">
            <p className="text-sm text-on-surface-variant">Belum ada riwayat kehadiran.</p>
          </Card>
        )}
      </div>

      {/* Desktop: full table. */}
      <Card className="hidden overflow-hidden p-0 md:block">
        <div className="overflow-x-auto table-scroll">
          <table className="w-full min-w-[680px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-5 py-4">Acara</th>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Waktu Hadir</th>
                <th className="px-5 py-4">Metode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {rows.length > 0 ? (
                rows.map((attendance) => (
                  <tr key={attendance.id}>
                    <td className="px-5 py-4 font-bold text-primary">{attendance.eventTitle}</td>
                    <td className="px-5 py-4">{attendance.eventDate ? formatDateID(attendance.eventDate) : "-"}</td>
                    <td className="px-5 py-4">{formatDateTimeWIB(attendance.attendedAt)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={attendance.method === "qr_code" ? "success" : "secondary"}>
                        {attendance.method === "qr_code" ? "QR Code" : "Manual"}
                      </Badge>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-on-surface-variant">
                    Belum ada riwayat kehadiran.
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
