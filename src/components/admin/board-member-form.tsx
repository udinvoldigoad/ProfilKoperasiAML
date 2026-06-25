"use client";

import { useRouter } from "next/navigation";
import { Save, UserPlus } from "lucide-react";
import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type FormState = {
  name: string;
  position: string;
  photoUrl: string;
  contact: string;
  period: string;
  sortOrder: string;
};

const EMPTY: FormState = {
  name: "",
  position: "",
  photoUrl: "",
  contact: "",
  period: "",
  sortOrder: "0"
};

export type BoardMemberFormProps = {
  mode?: "create" | "edit";
  memberId?: string;
  initial?: Partial<FormState>;
};

export function BoardMemberForm({ mode = "create", memberId, initial }: BoardMemberFormProps) {
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
      const url = isEdit ? `/api/admin/struktur/${memberId}` : "/api/admin/struktur";
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan pengurus.");
        return;
      }
      router.push("/admin/struktur");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Nama Pengurus
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Mulyono"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Jabatan
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Ketua Koperasi"
          value={form.position}
          onChange={(event) => update("position", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Periode
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="2025 - 2028"
          value={form.period}
          onChange={(event) => update("period", event.target.value)}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Urutan Tampil
        <input
          type="number"
          min={0}
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.sortOrder}
          onChange={(event) => update("sortOrder", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Kontak (opsional)
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="+62812..."
          value={form.contact}
          onChange={(event) => update("contact", event.target.value)}
        />
      </label>
      <div className="md:col-span-2">
        <ImageUploadField
          label="Foto Pengurus (opsional)"
          value={form.photoUrl}
          bucket="board-photos"
          maxDimension={320}
          onChange={(url) => update("photoUrl", url)}
        />
      </div>

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
          {isEdit ? <Save size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Pengurus"}
        </button>
        <p className="mt-3 text-sm text-muted-text">
          Urutan tampil menentukan posisi pada bagan struktur (angka terkecil tampil paling atas/kiri).
        </p>
      </div>
    </form>
  );
}
