"use client";

import { useRouter } from "next/navigation";
import { FileSpreadsheet, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ImportRow = {
  row: number;
  memberNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  email: string;
  phone: string;
  memberType: "anggota_lama" | "anggota_baru";
  valid: boolean;
  error?: string;
};

type CommitResult = { created: number; skipped: number; errors: string[] };

export function MemberImport() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [rows, setRows] = useState<ImportRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<null | "preview" | "commit">(null);
  const [result, setResult] = useState<CommitResult | null>(null);

  const validCount = rows?.filter((r) => r.valid).length ?? 0;
  const invalidCount = (rows?.length ?? 0) - validCount;

  async function handlePreview() {
    if (!file) {
      setError("Pilih file Excel terlebih dahulu.");
      return;
    }
    setError(null);
    setResult(null);
    setBusy("preview");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/anggota/import?mode=preview", { method: "POST", body: formData });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal membaca file.");
        return;
      }
      setRows(data.rows);
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setBusy(null);
    }
  }

  async function handleCommit() {
    if (!rows) return;
    setError(null);
    setBusy("commit");
    try {
      const response = await fetch("/api/admin/anggota/import?mode=commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: rows.filter((r) => r.valid) })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal mengimpor.");
        return;
      }
      setResult({ created: data.created, skipped: data.skipped, errors: data.errors ?? [] });
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Card>
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container-low text-primary">
            <FileSpreadsheet size={28} aria-hidden="true" />
          </span>
          <div>
            <h2 className="text-xl font-bold text-primary">Upload file .xlsx</h2>
            <p className="mt-2 text-sm text-on-surface-variant">
              Kolom: <strong>A</strong> No Anggota, <strong>B</strong> Nama, <strong>C</strong> NIK, <strong>D</strong> Tempat
              Lahir, <strong>E</strong> Tanggal Lahir (YYYY-MM-DD), <strong>F</strong> Alamat, <strong>G</strong> Email,
              <strong> H</strong> No HP. Baris 1 = judul kolom. Baris ber-<em>highlight kuning</em> dideteksi sebagai
              anggota baru.
            </p>
          </div>
        </div>
        <label className="mt-6 grid gap-2 text-sm font-bold text-primary">
          File Excel
          <input
            type="file"
            accept=".xlsx"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null);
              setRows(null);
              setResult(null);
            }}
            className="min-h-12 rounded-lg border border-dashed border-primary-container bg-surface-gray p-3 font-normal"
          />
          <span className="text-xs font-normal text-muted-text">
            Tips: format kolom NIK sebagai Text di Excel agar 16 digit tidak terpotong.
          </span>
        </label>
        <button
          type="button"
          onClick={handlePreview}
          disabled={busy !== null}
          className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary-container px-5 text-sm font-bold text-white disabled:opacity-60"
        >
          <UploadCloud size={18} aria-hidden="true" />
          {busy === "preview" ? "Membaca..." : "Preview Import"}
        </button>

        {error ? (
          <p className="mt-4 rounded-lg bg-error/10 px-4 py-3 text-sm font-bold text-error" role="alert">
            {error}
          </p>
        ) : null}

        {result ? (
          <div className="mt-4 grid gap-2 rounded-lg bg-green-100 px-4 py-3 text-sm font-bold text-green-800">
            <p>Import selesai: {result.created} dibuat, {result.skipped} dilewati (sudah ada).</p>
            {result.errors.length > 0 ? (
              <ul className="list-disc pl-5 font-normal">
                {result.errors.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}
      </Card>

      <Card className="overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-border-subtle p-5">
          <div>
            <h2 className="text-xl font-bold text-primary">Preview Deteksi</h2>
            <p className="text-sm text-muted-text">
              {rows ? `${validCount} valid, ${invalidCount} perlu diperbaiki.` : "Belum ada file di-preview."}
            </p>
          </div>
          {rows && validCount > 0 && !result ? (
            <button
              type="button"
              onClick={handleCommit}
              disabled={busy !== null}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-container px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {busy === "commit" ? "Mengimpor..." : `Konfirmasi Import (${validCount})`}
            </button>
          ) : null}
        </div>
        <div className="overflow-x-auto table-scroll">
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-surface-gray text-sm text-on-surface-variant">
              <tr>
                <th className="px-5 py-3">Baris</th>
                <th className="px-5 py-3">Nama</th>
                <th className="px-5 py-3">NIK</th>
                <th className="px-5 py-3">Tipe</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {!rows ? (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-muted-text">
                    Unggah file lalu klik Preview Import.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.row} className={row.memberType === "anggota_baru" ? "bg-amber-50" : "bg-white"}>
                    <td className="px-5 py-4">{row.row}</td>
                    <td className="px-5 py-4 font-bold">{row.fullName || "-"}</td>
                    <td className="px-5 py-4">{row.nik || "-"}</td>
                    <td className="px-5 py-4">{row.memberType === "anggota_baru" ? "Anggota Baru" : "Anggota Lama"}</td>
                    <td className="px-5 py-4">
                      <Badge tone={row.valid ? "success" : "danger"}>{row.valid ? "Valid" : row.error ?? "Tidak valid"}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
