"use client";

import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { useId, useRef, useState } from "react";

/**
 * Downscales an image to `maxDimension` (longest side) and re-encodes it as
 * WebP in the browser before upload, so only a small thumbnail is stored.
 * Falls back to the original file if anything fails.
 */
async function compressImage(file: File, maxDimension: number, quality = 0.82): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
    if (!blob) return file;

    const name = `${file.name.replace(/\.[^.]+$/, "")}.webp`;
    return new File([blob], name, { type: "image/webp" });
  } catch {
    return file;
  }
}

export function ImageUploadField({
  label,
  value,
  bucket,
  onChange,
  maxDimension = 800
}: {
  label: string;
  value: string;
  bucket: "board-photos" | "unit-photos" | "member-photos";
  onChange: (url: string) => void;
  /** Longest-side cap for the stored thumbnail (px). */
  maxDimension?: number;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // URLs uploaded in this (unsaved) session — safe to delete if superseded.
  const sessionUploads = useRef<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function discardIfThrowaway(url: string) {
    if (!url || !sessionUploads.current.has(url)) return;
    sessionUploads.current.delete(url);
    void fetch("/api/admin/upload", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    }).catch(() => {});
  }

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const previous = value;
    setError(null);
    setLoading(true);
    try {
      const optimized = await compressImage(file, maxDimension);
      const data = new FormData();
      data.append("file", optimized);
      data.append("bucket", bucket);
      const response = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error ?? "Gagal mengunggah file.");
        return;
      }
      sessionUploads.current.add(json.url);
      onChange(json.url);
      // Remove the just-replaced file if it was an unsaved upload from this session.
      discardIfThrowaway(previous);
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="grid gap-2 text-sm font-bold text-primary">
      {label}
      <div className="flex items-center gap-4">
        {value ? (
          <img src={value} alt={label} className="h-20 w-20 shrink-0 rounded-2xl border border-border-subtle object-cover" />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-border-subtle text-muted-text">
            <ImagePlus size={22} aria-hidden="true" />
          </div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          <label
            htmlFor={inputId}
            className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-primary-container bg-white px-4 py-2 text-sm font-bold text-primary"
          >
            {loading ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <ImagePlus size={16} aria-hidden="true" />}
            {loading ? "Mengunggah..." : value ? "Ganti Foto" : "Unggah Foto"}
          </label>
          <input
            id={inputId}
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFile}
            disabled={loading}
          />
          {value ? (
            <button
              type="button"
              onClick={() => {
                discardIfThrowaway(value);
                onChange("");
              }}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-error/40 bg-white px-3 py-2 text-sm font-bold text-error"
            >
              <Trash2 size={16} aria-hidden="true" />
              Hapus
            </button>
          ) : null}
        </div>
      </div>
      <p className="font-normal text-muted-text">JPG, PNG, atau WEBP. Maksimal 2 MB.</p>
      {error ? <p className="font-normal text-error">{error}</p> : null}
    </div>
  );
}
