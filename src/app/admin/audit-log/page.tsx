import { AuditLogTable } from "@/components/admin/audit-log-table";
import { AdminPageHeader } from "@/components/admin/page-header";
import { Card } from "@/components/ui/card";
import { listAuditLogs } from "@/lib/db/audit-logs";

export default async function AdminAuditLogPage() {
  const logs = await listAuditLogs(100);

  return (
    <div className="mx-auto max-w-container">
      <AdminPageHeader title="Audit Log" description="Jejak aksi sensitif: create, update, delete, reset password, dan import." />
      <Card className="overflow-hidden p-0">
        <AuditLogTable logs={logs} />
      </Card>
    </div>
  );
}
