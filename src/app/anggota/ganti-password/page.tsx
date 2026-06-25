import { ShieldAlert } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ChangePasswordForm } from "@/components/anggota/change-password-form";

export default function GantiPasswordPage() {
  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-start gap-3 rounded-2xl border border-secondary-container/40 bg-secondary-container/10 p-4">
        <ShieldAlert size={22} className="mt-0.5 shrink-0 text-secondary" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold text-primary">Ganti Password Wajib</h1>
          <p className="mt-1 text-sm text-on-surface-variant">
            Password awal Anda masih sama dengan NIK. Demi keamanan, buat password baru sebelum melanjutkan.
          </p>
        </div>
      </div>
      <Card>
        <ChangePasswordForm />
      </Card>
    </div>
  );
}
