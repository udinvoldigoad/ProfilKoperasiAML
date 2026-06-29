import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { parseQrToken, resolveEventStatus } from "@/lib/utils";

function getClientIp(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip");
}

function isExpired(value: Date | null) {
  if (!value) return false;
  const expiry = value.getTime();
  return Number.isFinite(expiry) && expiry < Date.now();
}

function dateOnly(value: Date | string): string {
  return typeof value === "string" ? value.slice(0, 10) : value.toISOString().slice(0, 10);
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

  if (!isDatabaseConfigured()) {
    return NextResponse.json(
      { ok: false, message: "Database MySQL belum dikonfigurasi, presensi belum bisa disimpan." },
      { status: 503 }
    );
  }

  try {
    const event = await prisma.event.findFirst({ where: { qrToken: token, deletedAt: null } });

    if (!event) {
      return NextResponse.json({ ok: false, message: "QR Code tidak valid atau sudah kedaluwarsa." }, { status: 400 });
    }

    const eventDate = dateOnly(event.date);
    const effectiveStatus = resolveEventStatus(eventDate, event.startTime.slice(0, 5), event.endTime.slice(0, 5), event.status);
    if (effectiveStatus !== "aktif" || isExpired(event.qrExpiresAt)) {
      return NextResponse.json({ ok: false, message: "Presensi belum dibuka atau acara sudah selesai." }, { status: 400 });
    }

    const member = await prisma.member.findFirst({
      where: { id: session.member.id, deletedAt: null },
      select: { id: true, fullName: true, status: true }
    });

    if (!member || member.status !== "aktif") {
      return NextResponse.json({ ok: false, message: "Akun anggota belum aktif untuk melakukan presensi." }, { status: 403 });
    }

    const attendance = await prisma.attendance.create({
      data: {
        eventId: event.id,
        memberId: member.id,
        attendedAt: new Date(),
        method: "qr_code",
        userAgent: request.headers.get("user-agent"),
        ipAddress: getClientIp(request)
      }
    });

    return NextResponse.json({
      ok: true,
      message: `Presensi berhasil dicatat untuk ${event.title}. Terima kasih, ${member.fullName}.`,
      result: {
        eventTitle: event.title,
        memberName: member.fullName,
        attendedAt: attendance.attendedAt.toISOString(),
        method: "QR Code"
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (/Unique constraint|duplicate|P2002/i.test(message)) {
      return NextResponse.json({ ok: false, message: "Anda sudah melakukan presensi pada acara ini." }, { status: 409 });
    }

    return NextResponse.json({ ok: false, message: "Gagal menyimpan presensi. Silakan coba lagi." }, { status: 500 });
  }
}