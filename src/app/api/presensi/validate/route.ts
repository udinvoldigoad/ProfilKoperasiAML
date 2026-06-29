import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { parseQrToken, resolveEventStatus } from "@/lib/utils";

type EventRow = {
  id: string;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  status: "draft" | "aktif" | "selesai" | "dibatalkan";
  qr_expires_at: string | null;
};

type MemberRow = {
  id: string;
  full_name: string;
  status: string;
};

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
}

function isExpired(value: string | null) {
  if (!value) return false;
  const expiry = new Date(value).getTime();
  return Number.isFinite(expiry) && expiry < Date.now();
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { token?: string };
  const token = parseQrToken(body.token || "");

  if (!token) {
    return NextResponse.json({ ok: false, message: "QR Code tidak berisi token presensi yang valid." }, { status: 400 });
  }

  const session = await getSessionUser();
  if (!session) {
    return NextResponse.json({ ok: false, message: "Sesi anggota tidak ditemukan. Silakan login ulang sebagai anggota." }, { status: 401 });
  }

  if (session.role !== "anggota" || !session.member) {
    return NextResponse.json({ ok: false, message: "Presensi QR hanya bisa dilakukan dari akun anggota." }, { status: 403 });
  }

  if (session.member.status !== "aktif") {
    return NextResponse.json({ ok: false, message: "Akun anggota belum aktif untuk melakukan presensi." }, { status: 403 });
  }
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, message: "Service role Supabase belum dikonfigurasi, presensi belum bisa disimpan." },
      { status: 503 }
    );
  }

  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id, title, date, start_time, end_time, status, qr_expires_at")
    .eq("qr_token", token)
    .is("deleted_at", null)
    .maybeSingle<EventRow>();

  if (eventError) {
    return NextResponse.json({ ok: false, message: "Gagal memvalidasi QR Code." }, { status: 500 });
  }

  if (!event) {
    return NextResponse.json({ ok: false, message: "QR Code tidak valid atau sudah kedaluwarsa." }, { status: 400 });
  }

  const effectiveStatus = resolveEventStatus(event.date, event.start_time?.slice(0, 5), event.end_time?.slice(0, 5), event.status);
  if (effectiveStatus !== "aktif" || isExpired(event.qr_expires_at)) {
    return NextResponse.json({ ok: false, message: "Presensi belum dibuka atau acara sudah selesai." }, { status: 400 });
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, full_name, status")
    .eq("id", session.member.id)
    .is("deleted_at", null)
    .maybeSingle<MemberRow>();

  if (memberError) {
    return NextResponse.json({ ok: false, message: "Gagal memvalidasi anggota." }, { status: 500 });
  }

  if (!member || member.status !== "aktif") {
    return NextResponse.json({ ok: false, message: "Akun anggota belum aktif untuk melakukan presensi." }, { status: 403 });
  }

  const attendedAt = new Date().toISOString();
  const { error: attendanceError } = await supabase.from("attendances").insert({
    event_id: event.id,
    member_id: member.id,
    attended_at: attendedAt,
    method: "qr_code",
    user_agent: request.headers.get("user-agent"),
    ip_address: getClientIp(request)
  });

  if (attendanceError?.code === "23505") {
    return NextResponse.json({ ok: false, message: "Anda sudah melakukan presensi pada acara ini." }, { status: 409 });
  }

  if (attendanceError) {
    return NextResponse.json({ ok: false, message: "Gagal menyimpan presensi. Silakan coba lagi." }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `Presensi berhasil dicatat untuk ${event.title}. Terima kasih, ${member.full_name}.`,
    result: {
      eventTitle: event.title,
      memberName: member.full_name,
      attendedAt,
      method: "QR Code"
    }
  });
}


