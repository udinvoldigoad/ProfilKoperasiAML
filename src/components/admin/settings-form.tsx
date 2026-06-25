"use client";

import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { useState } from "react";
import { useNotify } from "@/components/ui/notification";
import type { SiteProfileInput } from "@/lib/db/settings";

const FIELDS: Array<{ key: keyof SiteProfileInput; label: string; type?: string }> = [
  { key: "name", label: "Nama Koperasi" },
  { key: "village", label: "Nama Desa" },
  { key: "district", label: "Kecamatan" },
  { key: "regency", label: "Kabupaten" },
  { key: "whatsapp", label: "WhatsApp Admin" },
  { key: "email", label: "Email", type: "email" },
  { key: "operationalHours", label: "Jam Operasional" }
];

export function SettingsForm({ initial }: { initial: SiteProfileInput }) {
  const router = useRouter();
  const notify = useNotify();
  const [form, setForm] = useState<SiteProfileInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof SiteProfileInput>(key: K, value: SiteProfileInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await fetch("/api/admin/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan pengaturan.");
        return;
      }
      notify("Pengaturan berhasil disimpan.");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      {FIELDS.map((field) => (
        <label key={field.key} className="grid gap-2 text-sm font-bold text-primary">
          {field.label}
          <input
            type={field.type ?? "text"}
            className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
            value={form[field.key]}
            onChange={(event) => update(field.key, event.target.value)}
            required={field.key !== "email"}
          />
        </label>
      ))}
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        Alamat
        <textarea
          className="min-h-28 rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface"
          value={form.address}
          onChange={(event) => update("address", event.target.value)}
          required
        />
      </label>

      {error ? (
        <p className="md:col-span-2 rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error" role="alert">
          {error}
        </p>
      ) : null}

      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={18} aria-hidden="true" />
          {loading ? "Menyimpan..." : "Simpan Pengaturan"}
        </button>
      </div>
    </form>
  );
}
