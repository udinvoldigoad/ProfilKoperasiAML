"use client";

import { useRouter } from "next/navigation";
import { MapPinPlus, Save } from "lucide-react";
import { useState } from "react";
import { ImageUploadField } from "@/components/admin/image-upload-field";

type UnitStatus = "aktif" | "nonaktif";

type FormState = {
  name: string;
  type: string;
  address: string;
  latitude: string;
  longitude: string;
  contact: string;
  description: string;
  photoUrl: string;
  mapsUrl: string;
  status: UnitStatus;
};

const EMPTY: FormState = {
  name: "",
  type: "",
  address: "",
  latitude: "",
  longitude: "",
  contact: "",
  description: "",
  photoUrl: "",
  mapsUrl: "",
  status: "aktif"
};

const STATUS_OPTIONS: UnitStatus[] = ["aktif", "nonaktif"];

export type UnitFormProps = {
  mode?: "create" | "edit";
  unitId?: string;
  initial?: Partial<FormState>;
};

export function UnitForm({ mode = "create", unitId, initial }: UnitFormProps) {
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
      const url = isEdit ? `/api/admin/unit/${unitId}` : "/api/admin/unit";
      const response = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan unit.");
        return;
      }
      router.push("/admin/unit");
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
        Nama Unit
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Koperasi Utama"
          value={form.name}
          onChange={(event) => update("name", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Tipe Unit
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Unit Usaha"
          value={form.type}
          onChange={(event) => update("type", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        Alamat
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="Dusun Krajan, Desa Giri Mulyo"
          value={form.address}
          onChange={(event) => update("address", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Latitude
        <input
          type="number"
          step="any"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="-5.3112"
          value={form.latitude}
          onChange={(event) => update("latitude", event.target.value)}
          required
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Longitude
        <input
          type="number"
          step="any"
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="105.5864"
          value={form.longitude}
          onChange={(event) => update("longitude", event.target.value)}
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
      <label className="grid gap-2 text-sm font-bold text-primary">
        Status
        <select
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.status}
          onChange={(event) => update("status", event.target.value as UnitStatus)}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </label>
      <div className="md:col-span-2">
        <ImageUploadField
          label="Foto Unit (opsional)"
          value={form.photoUrl}
          bucket="unit-photos"
          onChange={(url) => update("photoUrl", url)}
        />
      </div>
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        URL Google Maps (opsional)
        <input
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          placeholder="https://maps.app.goo.gl/..."
          value={form.mapsUrl}
          onChange={(event) => update("mapsUrl", event.target.value)}
        />
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary md:col-span-2">
        Deskripsi
        <textarea
          className="min-h-32 rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface"
          placeholder="Deskripsi singkat layanan unit"
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
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
          {isEdit ? <Save size={18} aria-hidden="true" /> : <MapPinPlus size={18} aria-hidden="true" />}
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Unit"}
        </button>
        <p className="mt-3 text-sm text-muted-text">
          Latitude/longitude menentukan titik unit pada peta. Jika URL Google Maps kosong, tautan dibuat otomatis dari koordinat.
        </p>
      </div>
    </form>
  );
}
