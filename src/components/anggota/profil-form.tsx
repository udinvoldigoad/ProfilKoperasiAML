"use client";

import { useRouter } from "next/navigation";
import { Camera, CheckCircle2, ImageUp, Save, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
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
const CROP_VIEWPORT_SIZE = 288;
const CROPPED_PHOTO_SIZE = 640;

type CropState = {
  x: number;
  y: number;
  zoom: number;
};

type CropImageSize = {
  width: number;
  height: number;
};

const FIELDS: Array<{ key: keyof ProfilFormState; label: string; placeholder: string; type?: string; required?: boolean }> = [
  { key: "fullName", label: "Nama Lengkap", placeholder: "Nama lengkap Anda", required: true },
  { key: "birthPlace", label: "Tempat Lahir", placeholder: "Kota/Kabupaten lahir", required: true },
  { key: "birthDate", label: "Tanggal Lahir", placeholder: "1990-01-01", type: "date", required: true },
  { key: "phone", label: "No HP", placeholder: "08xxxxxxxxxx" },
  { key: "address", label: "Alamat", placeholder: "Alamat lengkap", required: true }
];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function baseImageSize(imageSize: CropImageSize) {
  const baseScale = Math.max(CROP_VIEWPORT_SIZE / imageSize.width, CROP_VIEWPORT_SIZE / imageSize.height);
  return {
    width: imageSize.width * baseScale,
    height: imageSize.height * baseScale,
    scale: baseScale
  };
}

function clampCrop(crop: CropState, imageSize: CropImageSize | null): CropState {
  if (!imageSize) return crop;
  const base = baseImageSize(imageSize);
  const renderWidth = base.width * crop.zoom;
  const renderHeight = base.height * crop.zoom;
  const maxX = Math.max(0, (renderWidth - CROP_VIEWPORT_SIZE) / 2);
  const maxY = Math.max(0, (renderHeight - CROP_VIEWPORT_SIZE) / 2);
  return {
    x: clamp(crop.x, -maxX, maxX),
    y: clamp(crop.y, -maxY, maxY),
    zoom: clamp(crop.zoom, 1, 3)
  };
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

async function cropImageToWebpFile(src: string, crop: CropState, imageSize: CropImageSize) {
  const image = await loadImage(src);
  const base = baseImageSize(imageSize);
  const totalScale = base.scale * crop.zoom;
  const renderedWidth = image.naturalWidth * totalScale;
  const renderedHeight = image.naturalHeight * totalScale;
  const imageLeft = CROP_VIEWPORT_SIZE / 2 + crop.x - renderedWidth / 2;
  const imageTop = CROP_VIEWPORT_SIZE / 2 + crop.y - renderedHeight / 2;
  const sourceX = (0 - imageLeft) / totalScale;
  const sourceY = (0 - imageTop) / totalScale;
  const sourceSize = CROP_VIEWPORT_SIZE / totalScale;

  const canvas = document.createElement("canvas");
  canvas.width = CROPPED_PHOTO_SIZE;
  canvas.height = CROPPED_PHOTO_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas tidak tersedia.");

  context.drawImage(image, sourceX, sourceY, sourceSize, sourceSize, 0, 0, CROPPED_PHOTO_SIZE, CROPPED_PHOTO_SIZE);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
  if (!blob) throw new Error("Gagal membuat hasil crop.");
  return new File([blob], `foto-profil-${Date.now()}.webp`, { type: "image/webp" });
}

export function ProfilForm({ initial, info }: { initial: ProfilFormInitial; info: ReadOnlyInfo }) {
  const router = useRouter();
  const photoInputRef = useRef<HTMLInputElement>(null);
  const dragStartRef = useRef<{ pointerId: number; x: number; y: number; cropX: number; cropY: number } | null>(null);
  const { photoUrl: initialPhotoUrl, ...profileInitial } = initial;
  const [form, setForm] = useState<ProfilFormState>(profileInitial);
  const [photoUrl, setPhotoUrl] = useState(initialPhotoUrl);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState(initialPhotoUrl);
  const [cropSourceUrl, setCropSourceUrl] = useState<string | null>(null);
  const [cropImageSize, setCropImageSize] = useState<CropImageSize | null>(null);
  const [crop, setCrop] = useState<CropState>({ x: 0, y: 0, zoom: 1 });
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

  useEffect(() => {
    return () => {
      if (cropSourceUrl) URL.revokeObjectURL(cropSourceUrl);
    };
  }, [cropSourceUrl]);

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

    setPhotoFile(null);
    setCropImageSize(null);
    setCrop({ x: 0, y: 0, zoom: 1 });
    setCropSourceUrl(URL.createObjectURL(file));
  }

  function closeCropModal() {
    setCropSourceUrl(null);
    setCropImageSize(null);
    setCrop({ x: 0, y: 0, zoom: 1 });
    if (photoInputRef.current) photoInputRef.current.value = "";
  }

  async function applyCrop() {
    if (!cropSourceUrl || !cropImageSize) return;

    setPhotoError(null);
    try {
      const croppedFile = await cropImageToWebpFile(cropSourceUrl, clampCrop(crop, cropImageSize), cropImageSize);
      setPhotoFile(croppedFile);
      closeCropModal();
    } catch {
      setPhotoError("Gagal menyesuaikan foto. Coba pilih gambar lain.");
    }
  }

  function updateCropZoom(value: number) {
    setCrop((prev) => clampCrop({ ...prev, zoom: value }, cropImageSize));
  }

  function handleCropPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStartRef.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      cropX: crop.x,
      cropY: crop.y
    };
  }

  function handleCropPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const start = dragStartRef.current;
    if (!start || start.pointerId !== event.pointerId) return;

    const nextCrop = {
      ...crop,
      x: start.cropX + event.clientX - start.x,
      y: start.cropY + event.clientY - start.y
    };
    setCrop(clampCrop(nextCrop, cropImageSize));
  }

  function handleCropPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStartRef.current?.pointerId === event.pointerId) {
      dragStartRef.current = null;
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
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
      if (photoInputRef.current) photoInputRef.current.value = "";
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

  const cropBaseSize = cropImageSize ? baseImageSize(cropImageSize) : null;

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
                ref={photoInputRef}
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

      {cropSourceUrl ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-primary">Sesuaikan Foto Profil</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Geser foto di dalam kotak, lalu atur zoom agar wajah terlihat rapi.
                </p>
              </div>
              <button
                type="button"
                onClick={closeCropModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-subtle text-on-surface-variant hover:bg-surface-gray"
                aria-label="Tutup crop foto"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid justify-items-center gap-4">
              <div
                className="relative h-72 w-72 touch-none overflow-hidden rounded-2xl border-4 border-primary-container bg-surface-gray shadow-inner"
                onPointerDown={handleCropPointerDown}
                onPointerMove={handleCropPointerMove}
                onPointerUp={handleCropPointerUp}
                onPointerCancel={handleCropPointerUp}
              >
                {cropBaseSize ? (
                  <img
                    src={cropSourceUrl}
                    alt="Preview crop foto profil"
                    draggable={false}
                    onLoad={(event) => {
                      const target = event.currentTarget;
                      const nextSize = { width: target.naturalWidth, height: target.naturalHeight };
                      setCropImageSize(nextSize);
                      setCrop((prev) => clampCrop(prev, nextSize));
                    }}
                    className="absolute select-none object-cover"
                    style={{
                      left: `${CROP_VIEWPORT_SIZE / 2 + crop.x}px`,
                      top: `${CROP_VIEWPORT_SIZE / 2 + crop.y}px`,
                      width: `${cropBaseSize.width}px`,
                      height: `${cropBaseSize.height}px`,
                      transform: `translate(-50%, -50%) scale(${crop.zoom})`
                    }}
                  />
                ) : (
                  <img
                    src={cropSourceUrl}
                    alt="Preview crop foto profil"
                    draggable={false}
                    onLoad={(event) => {
                      const target = event.currentTarget;
                      const nextSize = { width: target.naturalWidth, height: target.naturalHeight };
                      setCropImageSize(nextSize);
                      setCrop((prev) => clampCrop(prev, nextSize));
                    }}
                    className="h-full w-full object-cover opacity-0"
                  />
                )}
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-white/90" aria-hidden="true" />
              </div>

              <label className="grid w-full gap-2 text-sm font-bold text-primary">
                Zoom Foto
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.01"
                  value={crop.zoom}
                  onChange={(event) => updateCropZoom(Number(event.target.value))}
                  className="w-full accent-primary-container"
                />
              </label>

              <div className="grid w-full grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={closeCropModal}
                  className="min-h-11 rounded-lg border border-border-subtle bg-white text-sm font-bold text-on-surface-variant hover:bg-surface-gray"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={applyCrop}
                  disabled={!cropImageSize}
                  className="min-h-11 rounded-lg bg-primary-container text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Gunakan Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

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
