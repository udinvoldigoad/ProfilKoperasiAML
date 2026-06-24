import { AdminPageHeader } from "@/components/admin/page-header";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { listAuditLogs } from "@/lib/db/audit-logs";
import { formatDateTimeWIB } from "@/lib/utils";

export default async function AdminAuditLogPage() {
  const logs = await listAuditLogs(100);

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Audit Log" description="Jejak aksi sensitif: create, update, delete, reset password, dan import." />
      <Card className="overflow-hidden p-0">
        <div className="overflow-x-auto table-scroll">
          <table className="w-full min-w-[760px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-5 py-4">Aktor</th>
                <th className="px-5 py-4">Aksi</th>
                <th className="px-5 py-4">Entitas</th>
                <th className="px-5 py-4">Ringkasan</th>
                <th className="px-5 py-4">Waktu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id}>
                    <td className="px-5 py-4 font-bold text-primary">{log.actor}</td>
                    <td className="px-5 py-4"><Badge tone="secondary">{log.action}</Badge></td>
                    <td className="px-5 py-4">{log.entityType}</td>
                    <td className="px-5 py-4">{log.summary}</td>
                    <td className="px-5 py-4 text-sm text-muted-text">{formatDateTimeWIB(log.createdAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">
                    Belum ada aktivitas tercatat. Aksi admin (tambah/ubah/hapus anggota & acara) akan muncul di sini.
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
