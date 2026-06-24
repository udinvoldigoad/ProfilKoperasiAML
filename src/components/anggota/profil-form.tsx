"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Save } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ProfilFormState = {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
};

type ReadOnlyInfo = {
  memberNumber: string;
  nik: string;
  status: string;
};

const FIELDS: Array<{ key: keyof ProfilFormState; label: string; placeholder: string; type?: string; required?: boolean }> = [
  { key: "fullName", label: "Nama Lengkap", placeholder: "Nama lengkap Anda", required: true },
  { key: "birthPlace", label: "Tempat Lahir", placeholder: "Kota/Kabupaten lahir", required: true },
  { key: "birthDate", label: "Tanggal Lahir", placeholder: "1990-01-01", type: "date", required: true },
  { key: "phone", label: "No HP", placeholder: "08xxxxxxxxxx" },
  { key: "address", label: "Alamat", placeholder: "Alamat lengkap", required: true }
];

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfilForm({ initial, info }: { initial: ProfilFormState; info: ReadOnlyInfo }) {
  const router = useRouter();
  const [form, setForm] = useState<ProfilFormState>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof ProfilFormState>(key: K, value: ProfilFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/anggota/profil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan perubahan.");
        return;
      }
      setSuccess(true);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  function closeSuccess() {
    setSuccess(false);
    router.refresh();
  }

  return (
    <>
      <Card>
        <div className="flex flex-col gap-6 md:flex-row">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl bg-primary-container text-3xl font-extrabold text-white">
            {initials(form.fullName) || "AN"}
          </div>
          <div className="flex-1">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["No Anggota", info.memberNumber],
                ["NIK", info.nik],
                ["Status", info.status]
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-surface-gray p-4">
                  <p className="text-sm font-bold text-muted-text">{label}</p>
                  <p className="mt-1 break-words font-bold text-primary">{value}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-text">
              No Anggota, NIK, dan status diatur oleh admin koperasi dan tidak dapat diubah dari sini.
            </p>
          </div>
        </div>

        <form className="mt-6 grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
          {FIELDS.map((field) => (
            <label
              key={field.key}
              className={field.key === "address" ? "grid gap-2 text-sm font-bold text-primary md:col-span-2" : "grid gap-2 text-sm font-bold text-primary"}
            >
              {field.label}
              <input
                className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
                placeholder={field.placeholder}
                type={field.type ?? "text"}
                value={form[field.key]}
                required={field.required}
                onChange={(event) => update(field.key, event.target.value)}
              />
            </label>
          ))}

          {error ? (
            <p className="rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error md:col-span-2" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3 md:col-span-2">
            <Badge tone="success">{info.status}</Badge>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={18} aria-hidden="true" />
              {loading ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </Card>

      {success ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-600 text-white">
              <CheckCircle2 size={36} strokeWidth={2.5} aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-xl font-extrabold text-primary">Berhasil Disimpan</h2>
            <p className="mt-2 text-sm text-on-surface-variant">Perubahan profil Anda telah tersimpan.</p>
            <button
              type="button"
              onClick={closeSuccess}
              className="mt-6 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-primary-container px-5 text-sm font-bold text-white"
            >
              Selesai
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
