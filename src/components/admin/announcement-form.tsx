"use client";

import { useRouter } from "next/navigation";
import { Megaphone, Save } from "lucide-react";
import { useState } from "react";

type FormState = {
  title: string;
  category: string;
  date: string;
  body: string;
  pinned: boolean;
};

const EMPTY: FormState = {
  title: "",
  category: "",
  date: "",
  body: "",
  pinned: false
};

export type AnnouncementFormProps = {
  mode?: "create" | "edit";
  announcementId?: string;
  initial?: Partial<FormState>;
};

export function AnnouncementForm({ mode = "create", announcementId, initial }: AnnouncementFormProps) {
  const router = useRouter();
  const isEdit = mode === "edit";
  const [form, setForm] = useState<FormState>({ ...EMPTY, ...initial });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const url = isEdit ? `/api/admin/pengumuman/${announcementId}` : "/api/admin/pengumuman";
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan pengumuman.");
        return;
      }
      router.push("/admin/pengumuman");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        Judul Pengumuman
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Rapat Anggota Tahunan 2026"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Kategori
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Kegiatan / Layanan / Distribusi"
          value={form.category}
          onChange={(event) => update("category", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Tanggal
        <input
          type="date"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.date}
          onChange={(event) => update("date", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        Isi Pengumuman
        <textarea
          className="min-h-40 rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface"
          placeholder="Tulis isi pengumuman secara lengkap dan jelas."
          value={form.body}
          onChange={(event) => update("body", event.target.value)}
          required
        />
      </label>
      <label className="flex items-center gap-3 text-sm font-bold text-primary md:col-span-2">
        <input
          type="checkbox"
          className="h-5 w-5 rounded border-border-subtle accent-secondary-container"
          checked={form.pinned}
          onChange={(event) => update("pinned", event.target.checked)}
        />
        Sematkan sebagai pengumuman penting (tampil paling atas)
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
          {isEdit ? <Save size={18} aria-hidden="true" /> : <Megaphone size={18} aria-hidden="true" />}
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Pengumuman"}
        </button>
      </div>
    </form>
  );
}
