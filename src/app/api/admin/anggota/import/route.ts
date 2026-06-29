import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSessionUser } from "@/lib/auth";
import { isValidNik, normalizeNik } from "@/lib/auth-identifiers";
import { createMember, type CreateMemberInput } from "@/lib/db/members";
import { clientIp, logAudit } from "@/lib/db/audit-logs";
import type { MemberType } from "@/types";

export const runtime = "nodejs";

// Supported member import layout:
// No | Nama Anggota | No Anggota | NIK | Tempat Lahir | Tanggal Lahir | Alamat | No HP
// Optional: Email and Tipe/Jenis Anggota. If type is not present, yellow-highlighted
// member rows are anggota_lama; rows without highlight are anggota_baru.

export type ImportRow = {
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

type ColumnKey = keyof Pick<
  ImportRow,
  "memberNumber" | "fullName" | "nik" | "birthPlace" | "birthDate" | "address" | "email" | "phone" | "memberType"
>;

type MemberLayout = {
  sheet: ExcelJS.Worksheet;
  headerRow: number;
  columns: Partial<Record<ColumnKey, number>>;
};

function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text.trim();
    if ("result" in value && value.result !== null && value.result !== undefined) return String(value.result).trim();
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((part) => part.text).join("").trim();
    }
  }
  return String(cell.text ?? value ?? "").trim();
}

function excelSerialDateToIso(serial: number): string {
  const utc = Date.UTC(1899, 11, 30) + Math.round(serial) * 24 * 60 * 60 * 1000;
  return new Date(utc).toISOString().slice(0, 10);
}

function normalizeYear(value: string): number {
  const year = Number(value);
  if (value.length === 2) return year >= 50 ? 1900 + year : 2000 + year;
  return year;
}

function isoDateFromParts(year: number, month: number, day: number): string | null {
  if (!Number.isInteger(year) || !Number.isInteger(month) || !Number.isInteger(day)) return null;
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;

  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;

  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function parseDateText(text: string): string | null {
  const value = text.trim();
  if (!value) return null;

  const iso = value.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (iso) return isoDateFromParts(Number(iso[1]), Number(iso[2]), Number(iso[3]));

  const idDate = value.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (idDate) return isoDateFromParts(normalizeYear(idDate[3]), Number(idDate[2]), Number(idDate[1]));

  return null;
}

function cellDate(cell: ExcelJS.Cell): string {
  const displayedDate = parseDateText(cell.text ?? "");
  if (displayedDate) return displayedDate;

  const textDate = parseDateText(cellText(cell));
  if (textDate) return textDate;

  const value = cell.value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "number" && Number.isFinite(value)) return excelSerialDateToIso(value);

  return cellText(cell);
}

function normalizeHeader(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "");
}


function parseMemberType(value: string): MemberType | null {
  const normalized = normalizeHeader(value);
  if (!normalized) return null;
  if (normalized.includes("baru")) return "anggota_baru";
  if (normalized.includes("lama") || normalized.includes("pendiri")) return "anggota_lama";
  return null;
}

function headerKey(value: string): ColumnKey | null {
  const header = normalizeHeader(value);
  if (!header) return null;
  if (header === "noanggota" || header === "nomoranggota" || header.includes("noanggota")) return "memberNumber";
  if (header === "nama" || header === "namaanggota" || header.includes("namaanggota")) return "fullName";
  if (header === "nik" || header.includes("nik")) return "nik";
  if (header.includes("tempatlahir")) return "birthPlace";
  if (header.includes("tanggallahir") || header.includes("tgllahir")) return "birthDate";
  if (header.includes("alamat")) return "address";
  if (header.includes("email")) return "email";
  if (header.includes("nohp") || header.includes("hp") || header.includes("telepon") || header.includes("telp")) return "phone";
  if (header.includes("tipe") || header.includes("jenis")) return "memberType";
  return null;
}

function isHighlighted(cell: ExcelJS.Cell): boolean {
  const fill = cell.fill as ExcelJS.FillPattern | undefined;
  if (!fill || fill.type !== "pattern" || fill.pattern !== "solid") return false;

  const color = fill.fgColor;
  if (!color) return false;

  if (color.argb) {
    const upper = color.argb.toUpperCase();
    return upper !== "FFFFFFFF" && upper !== "00000000" && upper !== "FF000000";
  }

  return color.theme !== undefined || "indexed" in color;
}

function findMemberLayout(workbook: ExcelJS.Workbook): MemberLayout | null {
  let best: MemberLayout | null = null;
  let bestScore = 0;

  for (const sheet of workbook.worksheets) {
    const rowLimit = Math.min(sheet.rowCount, 12);
    for (let rowNumber = 1; rowNumber <= rowLimit; rowNumber += 1) {
      const columns: Partial<Record<ColumnKey, number>> = {};
      const row = sheet.getRow(rowNumber);

      row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
        const key = headerKey(cellText(cell));
        if (key && !columns[key]) columns[key] = colNumber;
      });

      const requiredScore = Number(Boolean(columns.memberNumber)) + Number(Boolean(columns.fullName)) + Number(Boolean(columns.nik));
      const totalScore = Object.keys(columns).length + requiredScore * 3;
      if (columns.memberNumber && columns.fullName && columns.nik && totalScore > bestScore) {
        best = { sheet, headerRow: rowNumber, columns };
        bestScore = totalScore;
      }
    }
  }

  return best;
}


function parseWorkbook(workbook: ExcelJS.Workbook): ImportRow[] {
  const layout = findMemberLayout(workbook);
  if (!layout) {
    throw new Error(
      "Format Excel belum sesuai. Pastikan ada header: Nama Anggota, No Anggota, NIK, Tempat Lahir, Tanggal Lahir, Alamat, dan No HP."
    );
  }

  const { sheet, headerRow, columns } = layout;
  const rows: ImportRow[] = [];

  for (let rowNumber = headerRow + 1; rowNumber <= sheet.rowCount; rowNumber += 1) {
    const excelRow = sheet.getRow(rowNumber);
    const memberNumber = cellText(excelRow.getCell(columns.memberNumber!));
    const fullName = cellText(excelRow.getCell(columns.fullName!));
    const nik = normalizeNik(cellText(excelRow.getCell(columns.nik!)));
    const birthPlace = columns.birthPlace ? cellText(excelRow.getCell(columns.birthPlace)) : "";
    const birthDate = columns.birthDate ? cellDate(excelRow.getCell(columns.birthDate)) : "";
    const address = columns.address ? cellText(excelRow.getCell(columns.address)) : "";
    const email = columns.email ? cellText(excelRow.getCell(columns.email)) : "";
    const phone = columns.phone ? cellText(excelRow.getCell(columns.phone)) : "";

    if (!memberNumber && !fullName && !nik) continue;

    const explicitType = columns.memberType ? parseMemberType(cellText(excelRow.getCell(columns.memberType))) : null;
    const highlighted = isHighlighted(excelRow.getCell(columns.memberNumber!)) || isHighlighted(excelRow.getCell(columns.fullName!));
    const memberType: ImportRow["memberType"] = explicitType ?? (highlighted ? "anggota_lama" : "anggota_baru");

    let error: string | undefined;
    if (!fullName) error = "Nama kosong.";
    else if (!isValidNik(nik)) error = "NIK harus 16 digit angka.";
    else if (!memberNumber) error = "No Anggota kosong.";
    else if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) error = "Tanggal lahir format YYYY-MM-DD.";
    else if (!birthPlace) error = "Tempat lahir kosong.";
    else if (!address) error = "Alamat kosong.";

    rows.push({
      row: rowNumber,
      memberNumber,
      fullName,
      nik,
      birthPlace,
      birthDate,
      address,
      email,
      phone,
      memberType,
      valid: !error,
      error
    });
  }

  return rows;
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }

  const mode = request.nextUrl.searchParams.get("mode") ?? "preview";

  if (mode === "preview") {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File Excel wajib diunggah." }, { status: 400 });
    }
    try {
      const buffer = Buffer.from(await file.arrayBuffer());
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as unknown as Parameters<typeof workbook.xlsx.load>[0]);
      const rows = parseWorkbook(workbook);
      const validCount = rows.filter((r) => r.valid).length;
      return NextResponse.json({ ok: true, rows, validCount, invalidCount: rows.length - validCount });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal membaca file. Pastikan format .xlsx valid.";
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  let body: { rows?: ImportRow[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const rows = (body.rows ?? []).filter((r) => r.valid && isValidNik(r.nik));
  if (rows.length === 0) {
    return NextResponse.json({ error: "Tidak ada baris valid untuk diimpor." }, { status: 400 });
  }

  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  for (const row of rows) {
    const input: CreateMemberInput = {
      memberNumber: row.memberNumber,
      fullName: row.fullName,
      nik: row.nik,
      birthPlace: row.birthPlace,
      birthDate: row.birthDate,
      address: row.address,
      email: row.email || undefined,
      phone: row.phone || undefined,
      memberType: row.memberType,
      status: "aktif"
    };
    const result = await createMember(input);
    if (result.ok) {
      created += 1;
    } else if (/sudah terdaftar|already|exists/i.test(result.error)) {
      skipped += 1;
    } else {
      errors.push(`Baris ${row.row} (${row.nik}): ${result.error}`);
    }
  }

  await logAudit({
    actorProfileId: session.profileId,
    action: "import",
    entityType: "members",
    summary: `Import anggota: ${created} dibuat, ${skipped} dilewati`,
    ipAddress: clientIp(request)
  });

  return NextResponse.json({ ok: true, created, skipped, errors });
}
