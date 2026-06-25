"use client";

import { useRouter } from "next/navigation";
import { Save, UserPlus } from "lucide-react";
import { useState } from "react";

type FormState = {
  memberNumber: string;
  fullName: string;
  nik: string;
  birthPlace: string;
  birthDate: string;
  address: string;
  email: string;
  phone: string;
  memberType: "anggota_lama" | "anggota_baru";
  status: "aktif" | "nonaktif" | "ditangguhkan";
};

const EMPTY: FormState = {
  memberNumber: "",
  fullName: "",
  nik: "",
  birthPlace: "",
  birthDate: "",
  address: "",
  email: "",
  phone: "",
  memberType: "anggota_lama",
  status: "aktif"
};

const TEXT_FIELDS: Array<{ key: keyof FormState; label: string; placeholder: string; type?: string; numeric?: boolean; hint?: string }> = [
  { key: "memberNumber", label: "No Anggota", placeholder: "Otomatis bila dikosongkan", hint: "Nomor urut otomatis (1, 2, 3, …) jika dibiarkan kosong" },
  { key: "fullName", label: "Nama Lengkap", placeholder: "Nama anggota" },
  { key: "nik", label: "NIK", placeholder: "16 digit angka", numeric: true },
  { key: "birthPlace", label: "Tempat Lahir", placeholder: "Lampung Timur" },
  { key: "birthDate", label: "Tanggal Lahir", placeholder: "1990-01-01", type: "date" },
  { key: "address", label: "Alamat", placeholder: "Alamat lengkap" },
  { key: "email", label: "Email", placeholder: "opsional@email.com", type: "email" },
  { key: "phone", label: "No HP", placeholder: "08xxxxxxxxxx" }
];

export type MemberFormProps = {
  mode?: "create" | "edit";
  memberId?: string;
  initial?: Partial<FormState>;
};

export function MemberForm({ mode = "create", memberId, initial }: MemberFormProps) {
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
      const url = isEdit ? `/api/admin/anggota/${memberId}` : "/api/admin/anggota";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit
        ? {
            fullName: form.fullName,
            birthPlace: form.birthPlace,
            birthDate: form.birthDate,
            address: form.address,
            email: form.email,
            phone: form.phone,
            memberType: form.memberType,
            status: form.status
          }
        : form;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error ?? "Gagal menyimpan anggota.");
        return;
      }
      router.push(isEdit ? `/admin/anggota/${memberId}` : "/admin/anggota");
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="grid gap-5 md:grid-cols-2" onSubmit={handleSubmit}>
      {TEXT_FIELDS.map((field) => {
        const locked = isEdit && (field.key === "nik" || field.key === "memberNumber");
        return (
          <label key={field.key} className="grid gap-2 text-sm font-bold text-primary">
            {field.label}
            {locked ? <span className="text-xs font-normal text-muted-text">(tidak dapat diubah)</span> : null}
            {!locked && field.hint ? <span className="text-xs font-normal text-muted-text">{field.hint}</span> : null}
            <input
              className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface disabled:bg-surface-gray disabled:text-muted-text"
              placeholder={field.placeholder}
              type={field.type ?? "text"}
              inputMode={field.numeric ? "numeric" : undefined}
              maxLength={field.key === "nik" ? 16 : undefined}
              value={form[field.key] as string}
              disabled={locked}
              onChange={(event) =>
                update(
                  field.key,
                  (field.numeric
                    ? event.target.value.replace(/\D/g, "").slice(0, 16)
                    : event.target.value) as FormState[typeof field.key]
                )
              }
              required={field.key !== "email" && field.key !== "phone" && field.key !== "memberNumber"}
            />
          </label>
        );
      })}
      <label className="grid gap-2 text-sm font-bold text-primary">
        Tipe Anggota
        <select
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.memberType}
          onChange={(event) => update("memberType", event.target.value as FormState["memberType"])}
        >
          <option value="anggota_lama">anggota_lama</option>
          <option value="anggota_baru">anggota_baru</option>
        </select>
      </label>
      <label className="grid gap-2 text-sm font-bold text-primary">
        Status
        <select
          className="min-h-12 rounded-lg border border-border-subtle px-4 font-normal text-on-surface"
          value={form.status}
          onChange={(event) => update("status", event.target.value as FormState["status"])}
        >
          <option value="aktif">aktif</option>
          <option value="nonaktif">nonaktif</option>
          <option value="ditangguhkan">ditangguhkan</option>
        </select>
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
          {isEdit ? <Save size={18} aria-hidden="true" /> : <UserPlus size={18} aria-hidden="true" />}
          {loading ? "Menyimpan..." : isEdit ? "Simpan Perubahan" : "Simpan Anggota"}
        </button>
        {!isEdit ? (
          <p className="mt-3 text-sm text-muted-text">
            Password awal anggota = NIK. Anggota dapat diminta menggantinya setelah login pertama.
          </p>
        ) : null}
      </div>
    </form>
  );
}
