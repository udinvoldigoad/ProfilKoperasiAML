import { NextRequest, NextResponse } from "next/server";
import ExcelJS from "exceljs";
import { getSessionUser } from "@/lib/auth";
import { isValidNik, normalizeNik } from "@/lib/auth-identifiers";
import { createMember, type CreateMemberInput } from "@/lib/db/members";

export const runtime = "nodejs";

// Column layout (row 1 = header):
// A No Anggota | B Nama | C NIK | D Tempat Lahir | E Tanggal Lahir | F Alamat | G Email | H No HP
// Yellow-highlighted row => anggota_baru, otherwise anggota_lama (per PRD).

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

function cellText(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value === null || value === undefined) return "";
  if (typeof value === "object" && "text" in value && typeof value.text === "string") return value.text.trim();
  return String(cell.text ?? "").trim();
}

function cellDate(cell: ExcelJS.Cell): string {
  const value = cell.value;
  if (value instanceof Date) {
    const y = value.getUTCFullYear();
    const m = String(value.getUTCMonth() + 1).padStart(2, "0");
    const d = String(value.getUTCDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  const text = cellText(cell);
  const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return match ? match[0] : text;
}

function isHighlighted(cell: ExcelJS.Cell): boolean {
  const fill = cell.fill as ExcelJS.FillPattern | undefined;
  if (!fill || fill.type !== "pattern" || fill.pattern !== "solid") return false;
  const argb = fill.fgColor?.argb;
  if (!argb) return false;
  const upper = argb.toUpperCase();
  // Ignore white / transparent / black fills; anything else counts as a highlight.
  return upper !== "FFFFFFFF" && upper !== "00000000" && upper !== "FF000000";
}

function parseWorkbook(workbook: ExcelJS.Workbook): ImportRow[] {
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];
  const rows: ImportRow[] = [];

  sheet.eachRow((excelRow, rowNumber) => {
    if (rowNumber === 1) return; // header
    const memberNumber = cellText(excelRow.getCell(1));
    const fullName = cellText(excelRow.getCell(2));
    const nik = normalizeNik(cellText(excelRow.getCell(3)));
    const birthPlace = cellText(excelRow.getCell(4));
    const birthDate = cellDate(excelRow.getCell(5));
    const address = cellText(excelRow.getCell(6));
    const email = cellText(excelRow.getCell(7));
    const phone = cellText(excelRow.getCell(8));

    // Skip completely empty rows.
    if (!memberNumber && !fullName && !nik) return;

    const highlighted = isHighlighted(excelRow.getCell(1)) || isHighlighted(excelRow.getCell(2));
    const memberType: ImportRow["memberType"] = highlighted ? "anggota_baru" : "anggota_lama";

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
  });

  return rows;
}

export async function POST(request: NextRequest) {
  const session = await getSessionUser();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Hanya admin yang diizinkan." }, { status: 403 });
  }
  if (session.demo) {
    return NextResponse.json({ error: "Mode demo tidak menyimpan data." }, { status: 503 });
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
    } catch {
      return NextResponse.json({ error: "Gagal membaca file. Pastikan format .xlsx valid." }, { status: 400 });
    }
  }

  // mode === "commit"
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

  return NextResponse.json({ ok: true, created, skipped, errors });
}
