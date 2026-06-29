import { NextRequest, NextResponse } from "next/server";
import { announcements, events, members, siteProfile } from "@/lib/data";
import { hashPassword } from "@/lib/passwords";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function dateInput(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

/**
 * One-time MySQL seeding for Hostinger.
 *
 *   POST /api/admin/seed   header: x-seed-secret: <SEED_SECRET>
 *
 * Admin credentials come from SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD.
 * Default member password = NIK and must be changed on first login.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SEED_SECRET;
  if (!secret || request.headers.get("x-seed-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isDatabaseConfigured()) {
    return NextResponse.json({ error: "DATABASE_URL MySQL belum dikonfigurasi." }, { status: 503 });
  }

  const result = {
    admin: "",
    membersCreated: 0,
    membersUpdated: 0,
    eventsUpserted: 0,
    announcementsUpserted: 0,
    settingsUpserted: false,
    errors: [] as string[]
  };

  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? siteProfile.email).toLowerCase();
  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (!adminPassword) {
    return NextResponse.json({ error: "SEED_ADMIN_PASSWORD wajib diisi." }, { status: 400 });
  }

  try {
    const existingAdmin = await prisma.profile.findFirst({ where: { role: "admin", email: adminEmail } });
    if (existingAdmin) {
      await prisma.profile.update({
        where: { id: existingAdmin.id },
        data: { passwordHash: hashPassword(adminPassword), mustChangePassword: false }
      });
      result.admin = `${adminEmail} (password diperbarui)`;
    } else {
      await prisma.profile.create({
        data: {
          role: "admin",
          email: adminEmail,
          passwordHash: hashPassword(adminPassword),
          mustChangePassword: false
        }
      });
      result.admin = `${adminEmail} (dibuat)`;
    }
  } catch (error) {
    result.errors.push(`admin: ${error instanceof Error ? error.message : "gagal"}`);
  }

  for (const member of members) {
    try {
      const existing = await prisma.member.findUnique({ where: { nik: member.nik }, include: { profile: true } });
      if (existing) {
        const profileId = existing.profileId ?? existing.profile?.id;
        if (profileId) {
          await prisma.profile.update({
            where: { id: profileId },
            data: {
              role: "anggota",
              email: member.email?.toLowerCase() ?? null,
              phone: member.phone ?? null,
              passwordHash: hashPassword(member.nik),
              mustChangePassword: true
            }
          });
        }

        await prisma.member.update({
          where: { id: existing.id },
          data: {
            memberNumber: member.memberNumber,
            fullName: member.fullName,
            birthPlace: member.birthPlace,
            birthDate: dateInput(member.birthDate),
            address: member.address,
            photoUrl: member.photoUrl ?? null,
            email: member.email ?? null,
            phone: member.phone ?? null,
            status: member.status,
            memberType: member.memberType
          }
        });
        result.membersUpdated += 1;
      } else {
        const profile = await prisma.profile.create({
          data: {
            role: "anggota",
            email: member.email?.toLowerCase() ?? null,
            phone: member.phone ?? null,
            passwordHash: hashPassword(member.nik),
            mustChangePassword: true
          }
        });

        await prisma.member.create({
          data: {
            profileId: profile.id,
            memberNumber: member.memberNumber,
            fullName: member.fullName,
            nik: member.nik,
            birthPlace: member.birthPlace,
            birthDate: dateInput(member.birthDate),
            address: member.address,
            photoUrl: member.photoUrl ?? null,
            email: member.email ?? null,
            phone: member.phone ?? null,
            status: member.status,
            memberType: member.memberType
          }
        });
        result.membersCreated += 1;
      }
    } catch (error) {
      result.errors.push(`${member.nik}: ${error instanceof Error ? error.message : "gagal"}`);
    }
  }

  for (const event of events) {
    try {
      await prisma.event.upsert({
        where: { qrToken: event.qrToken },
        update: {
          title: event.title,
          date: dateInput(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          description: event.description,
          status: event.status,
          qrExpiresAt: event.qrExpiresAt ? new Date(event.qrExpiresAt) : null
        },
        create: {
          title: event.title,
          date: dateInput(event.date),
          startTime: event.startTime,
          endTime: event.endTime,
          location: event.location,
          description: event.description,
          status: event.status,
          qrToken: event.qrToken,
          qrExpiresAt: event.qrExpiresAt ? new Date(event.qrExpiresAt) : null
        }
      });
      result.eventsUpserted += 1;
    } catch (error) {
      result.errors.push(`${event.qrToken}: ${error instanceof Error ? error.message : "gagal"}`);
    }
  }

  for (const announcement of announcements) {
    try {
      await prisma.announcement.upsert({
        where: { id: announcement.id },
        update: {
          title: announcement.title,
          body: announcement.body,
          category: announcement.category,
          date: dateInput(announcement.date),
          pinned: Boolean(announcement.pinned)
        },
        create: {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          category: announcement.category,
          date: dateInput(announcement.date),
          pinned: Boolean(announcement.pinned)
        }
      });
      result.announcementsUpserted += 1;
    } catch (error) {
      result.errors.push(`${announcement.id}: ${error instanceof Error ? error.message : "gagal"}`);
    }
  }

  try {
    await prisma.setting.upsert({
      where: { key: "site_profile" },
      update: { value: siteProfile },
      create: { key: "site_profile", value: siteProfile }
    });
    result.settingsUpserted = true;
  } catch (error) {
    result.errors.push(`settings: ${error instanceof Error ? error.message : "gagal"}`);
  }

  return NextResponse.json({ ok: result.errors.length === 0, ...result });
}