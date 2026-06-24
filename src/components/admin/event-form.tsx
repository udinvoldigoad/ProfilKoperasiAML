"use client";

import { useRouter } from "next/navigation";
import { CalendarPlus, Save } from "lucide-react";
import { useState } from "react";

type EventStatus = "draft" | "aktif" | "selesai" | "dibatalkan";

type FormState = {
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  status: EventStatus;
};

const EMPTY: FormState = {
  title: "",
  date: "",
  startTime: "",
  endTime: "",
  location: "",
  description: "",
  status: "draft"
};

const STATUS_OPTIONS: EventStatus[] = ["draft", "aktif", "selesai", "dibatalkan"];

export type EventFormProps = {
  mode?: "create" | "edit";
  eventId?: string;
  initial?: Partial<FormState>;
};

export function EventForm({ mode = "create", eventId, initial }: EventFormProps) {
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
      const url = isEdit ? `/api/admin/acara/${eventId}` : "/api/admin/acara";
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan acara.");
        return;
      }
      router.push(isEdit ? `/admin/acara/${eventId}` : `/admin/acara/${data.id}`);
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
        Judul Acara
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Rapat Anggota Tahunan 2026"
          value={form.title}
          onChange={(event) => update("title", event.target.value)}
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
      <label className="grid gap-2 text-sm font-bold text-primary">
        Lokasi
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Balai Desa Giri Mulyo"
          value={form.location}
          onChange={(event) => update("location", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Jam Mulai
        <input
          type="time"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.startTime}
          onChange={(event) => update("startTime", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Jam Selesai
        <input
          type="time"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.endTime}
          onChange={(event) => update("endTime", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Status
        <select
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.status}
          onChange={(event) => update("status", event.target.value as EventStatus)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        Deskripsi
        <textarea
          className="min-h-32 rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface"
          placeholder="Agenda dan keterangan acara"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
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
          {isEdit ? <Save size={18} aria-hidden="true" /> : <CalendarPlus size={18} aria-hidden="true" />}
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Acara"}
        </button>
        {!isEdit ? (
          <p className="mt-3 text-sm text-muted-text">
            QR presensi dengan token unik dibuat otomatis. Atur status ke <strong>aktif</strong> agar QR bisa dipindai anggota.
          </p>
        ) : null}
      </div>
    </form>
  );
}
