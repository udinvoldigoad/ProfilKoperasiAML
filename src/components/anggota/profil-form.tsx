"use client";

import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, ImageUp, Save, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ProfilFormState = {
  fullName: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
};

type ProfilFormInitial = ProfilFormState & {
  photoUrl: string;
};

type ReadOnlyInfo = {
  memberNumber: string;
  nik: string;
  status: string;
};

const PROFILE_PHOTO_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const PROFILE_PHOTO_MAX_FILE_SIZE = 4 * 1024 * 1024;

const FIELDS: Array<{ key: keyof ProfilFormState; label: string; placeholder: string; type?: string; required?: boolean }> = [
  { key: "fullName", label: "Nama Lengkap", placeholder: "Nama lengkap Anda", required: true },
  { key: "birthPlace", label: "Tempat Lahir", placeholder: "Kota/Kabupaten lahir", required: true },
  { key: "birthDate", label: "Tanggal Lahir", placeholder: "1990-01-01", type: "date", required: true },
  { key: "phone", label: "No HP", placeholder: "08xxxxxxxxxx" },
  { key: "address", label: "Alamat", placeholder: "Alamat lengkap", required: true }
];

export function ProfilForm({ initial, info }: { initial: ProfilFormInitial; info: ReadOnlyInfo }) {
  const router = useRouter();
  const { photoUrl: initialPhotoUrl, ...profileInitial } = initial;
  const [form, setForm] = useState<ProfilFormState>(profileInitial);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(initialPhotoUrl);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoSuccess, setPhotoSuccess] = useState(false);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!photoFile) {
      setPhotoPreview(photoUrl);
      return;
    }

    const objectUrl = URL.createObjectURL(photoFile);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [photoFile, photoUrl]);

  function update<K extends keyof ProfilFormState>(key: K, value: ProfilFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handlePhotoSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setPhotoError(null);
    setPhotoSuccess(false);

    if (!file) {
      setPhotoFile(null);
      return;
    }

    if (!PROFILE_PHOTO_ALLOWED_TYPES.includes(file.type)) {
      setPhotoFile(null);
      setPhotoError("Format foto harus JPG, PNG, atau WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > PROFILE_PHOTO_MAX_FILE_SIZE) {
      setPhotoFile(null);
      setPhotoError("Ukuran foto maksimal 4 MB.");
      event.target.value = "";
      return;
    }

    setPhotoFile(file);
  }

  async function handlePhotoSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!photoFile) return;

    setPhotoError(null);
    setPhotoSuccess(false);
    setPhotoLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", photoFile);
      const response = await fetch("/api/anggota/profil/foto", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setPhotoError(data.error ?? "Gagal menyimpan foto.");
        return;
      }
      setPhotoUrl(data.photoUrl);
      setPhotoFile(null);
      setPhotoSuccess(true);
      router.refresh();
    } catch {
      setPhotoError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setPhotoLoading(false);
    }
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
        <div className="flex flex-col items-center gap-6 text-center md:flex-row md:items-start md:text-left">
          <div className="grid shrink-0 justify-items-center gap-3">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-3xl bg-primary-container text-white">
              {photoPreview ? (
                <img src={photoPreview} alt="Foto profil anggota" className="h-full w-full object-cover" />
              ) : (
                <UserRound size={54} strokeWidth={2.3} aria-hidden="true" />
              )}
            </div>
            <form className="flex flex-wrap justify-center gap-2" onSubmit={handlePhotoSubmit}>
              <input
                id="profile-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={handlePhotoSelect}
              />
              <label
                htmlFor="profile-photo-input"
                className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-border-subtle bg-white px-3 text-xs font-bold text-primary transition hover:bg-surface-gray"
              >
                <Camera size={16} aria-hidden="true" />
                Pilih Foto
              </label>
              <button
                type="submit"
                disabled={!photoFile || photoLoading}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary-container px-3 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                <ImageUp size={16} aria-hidden="true" />
                {photoLoading ? "Menyimpan..." : "Simpan Foto"}
              </button>
            </form>
            {photoError ? <p className="max-w-52 text-xs font-bold text-error" role="alert">{photoError}</p> : null}
            {photoSuccess ? <p className="max-w-52 text-xs font-bold text-green-700">Foto tersimpan.</p> : null}
          </div>
          <div className="w-full flex-1">
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
