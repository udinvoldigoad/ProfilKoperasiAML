import Link from "next/link";
import { ArrowUpRight, CalendarDays, QrCode, UserRound } from "lucide-react";
import { DashboardAttendanceList } from "@/components/anggota/dashboard-attendance-list";
import { Card } from "@/components/ui/card";
import { getSessionUser } from "@/lib/auth";
import { getMemberForSession } from "@/lib/db/members";
import { listMemberAttendances } from "@/lib/db/attendances";
import { listEvents } from "@/lib/db/events";

export default async function AnggotaDashboardPage() {
  const session = await getSessionUser();
  const member = session?.member ? await getMemberForSession(session.member.id) : null;
  const events = await listEvents();
  const activeEvent = events.find((event) => event.status === "aktif") ?? null;
  const upcoming = events.filter((event) => event.status === "draft").sort((a, b) => a.date.localeCompare(b.date));
  const nextEvent = activeEvent ?? upcoming[0] ?? null;
  const hasActiveEvent = Boolean(activeEvent);
  const memberAttendances = member ? await listMemberAttendances(member.id) : [];

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-border-subtle bg-primary-container p-6 text-white">
        <p className="text-sm font-bold text-[#93cfe6]">Selamat datang</p>
        <h1 className="mt-2 text-2xl font-extrabold sm:text-3xl">{member?.fullName ?? "Anggota"}</h1>
        <p className="mt-2 text-white/85">
          {member?.memberNumber ?? "-"}
          {member?.address ? ` - ${member.address}` : ""}
        </p>
      </section>

      <div className="grid grid-cols-3 gap-3 sm:gap-6">
        <Link
          href="/anggota/profil"
          className="group flex flex-col rounded-3xl border border-border-subtle bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft active:translate-y-0 sm:p-6"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-surface-container-low text-primary transition-colors group-hover:bg-primary-container group-hover:text-white sm:h-12 sm:w-12">
              <UserRound size={22} aria-hidden="true" />
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-gray text-muted-text transition-all group-hover:bg-primary-container group-hover:text-white">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
          <h2 className="mt-3 text-sm font-bold text-primary sm:mt-5 sm:text-lg">Profil</h2>
          <p className="mt-1 hidden text-sm text-on-surface-variant sm:block">Lengkapi data alamat, tempat lahir, dan nomor HP.</p>
        </Link>

        <Link
          href="/anggota/acara"
          className="group flex flex-col rounded-3xl border border-border-subtle bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-secondary/30 hover:shadow-soft active:translate-y-0 sm:p-6"
        >
          <div className="flex items-start justify-between">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#ffdcc7] text-secondary transition-colors group-hover:bg-secondary group-hover:text-white sm:h-12 sm:w-12">
              <CalendarDays size={22} aria-hidden="true" />
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface-gray text-muted-text transition-all group-hover:bg-secondary group-hover:text-white">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
          <h2 className="mt-3 text-sm font-bold text-primary sm:mt-5 sm:text-lg">Acara</h2>
          <p className="mt-1 hidden text-sm text-on-surface-variant sm:block">{nextEvent ? nextEvent.title : "Belum ada acara terjadwal"}</p>
        </Link>

        <Link
          href="/presensi/scan"
          className="group relative flex flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-secondary-container to-secondary p-4 text-white shadow-soft transition-all duration-200 hover:-translate-y-1 hover:shadow-lg active:translate-y-0 sm:p-6"
        >
          <QrCode className="pointer-events-none absolute -right-5 -top-5 text-white/15 transition-transform duration-300 group-hover:scale-110" size={110} aria-hidden="true" />
          <div className="relative flex items-start justify-between">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-white/20 sm:h-12 sm:w-12">
              <QrCode size={22} aria-hidden="true" />
              {hasActiveEvent ? (
                <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3" title="Ada acara aktif">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-white" />
                </span>
              ) : null}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/25 text-white transition-all group-hover:bg-white group-hover:text-secondary">
              <ArrowUpRight size={16} aria-hidden="true" />
            </span>
          </div>
          <h2 className="relative mt-3 text-sm font-extrabold sm:mt-5 sm:text-lg">Presensi QR</h2>
          <p className="relative mt-1 hidden text-sm text-white/90 sm:block">Pindai QR acara untuk mencatat kehadiran Anda secara instan.</p>
        </Link>
      </div>

      <Card>
        <h2 className="text-xl font-bold text-primary">Riwayat Terbaru</h2>
        <DashboardAttendanceList rows={memberAttendances} />
      </Card>
    </div>
  );
}
