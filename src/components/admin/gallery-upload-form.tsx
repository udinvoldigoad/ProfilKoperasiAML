"use client";

import { useRouter } from "next/navigation";
import { ImagePlus, Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNotify } from "@/components/ui/notification";

export function GalleryUploadForm() {
  const router = useRouter();
  const notify = useNotify();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Kegiatan");
  const [eventDate, setEventDate] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!file) {
      setError("Pilih file gambar terlebih dahulu.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("category", category);
      formData.append("eventDate", eventDate);
      formData.append("description", description);
      formData.append("file", file);

      const response = await fetch("/api/admin/galeri", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal mengupload foto.");
        return;
      }

      notify("Foto galeri berhasil diupload.");
      setTitle("");
      setCategory("Kegiatan");
      setEventDate("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid w-full min-w-0 gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]" onSubmit={handleSubmit}>
      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <label className="grid min-w-0 gap-2 text-sm font-bold text-primary md:col-span-2">
          Judul Foto
          <input
            className="min-h-12 w-full min-w-0 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
            placeholder="Kegiatan koperasi"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-primary">
          Kategori
          <input
            className="min-h-12 w-full min-w-0 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
            placeholder="Kegiatan / Prestasi / Pertanian"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            required
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-primary">
          Tanggal
          <input
            type="date"
            className="min-h-12 w-full min-w-0 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
            value={eventDate}
            onChange={(event) => setEventDate(event.target.value)}
          />
        </label>
        <label className="grid min-w-0 gap-2 text-sm font-bold text-primary md:col-span-2">
          Deskripsi
          <textarea
            className="min-h-28 w-full min-w-0 resize-y rounded-lg border border-border-subtle px-4 py-3 font-normal text-on-surface"
            placeholder="Keterangan singkat foto"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </label>
        <div className="grid min-w-0 gap-2 text-sm font-bold text-primary md:col-span-2">
          <span>File Gambar</span>
          <div className="flex min-w-0 flex-col gap-2 rounded-lg border border-border-subtle bg-white p-3 sm:flex-row sm:items-center">
            <input
              ref={fileInputRef}
              id="gallery-file-input"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              required
            />
            <label
              htmlFor="gallery-file-input"
              className="inline-flex min-h-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-primary-container px-4 text-xs font-bold text-white transition hover:bg-teal-dark"
            >
              Pilih File
            </label>
            <span className="min-w-0 flex-1 truncate text-xs font-semibold text-muted-text">
              {file ? file.name : "Belum ada file dipilih"}
            </span>
          </div>
        </div>
        {error ? (
          <p className="rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error md:col-span-2" role="alert">
            {error}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Upload size={18} aria-hidden="true" />
            {loading ? "Mengupload..." : "Upload Foto"}
          </button>
        </div>
      </div>

      <div className="min-w-0 overflow-hidden rounded-2xl border border-border-subtle bg-surface-gray">
        {previewUrl ? (
          <img src={previewUrl} alt="Preview foto galeri" className="aspect-[4/3] h-full w-full object-cover" />
        ) : (
          <div className="flex aspect-[4/3] h-full min-h-56 flex-col items-center justify-center gap-3 text-center text-muted-text">
            <ImagePlus size={34} aria-hidden="true" />
            <span className="text-sm font-bold">Preview foto</span>
          </div>
        )}
      </div>
    </form>
  );
}
