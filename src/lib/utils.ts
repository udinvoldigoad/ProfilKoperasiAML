import { clsx, type ClassValue } from "clsx";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const WIB_TIMEZONE = "Asia/Jakarta";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDateID(date: string) {
  return format(parseISO(date), "d MMMM yyyy", { locale: id });
}

export function formatDateTimeWIB(date: string) {
  return formatInTimeZone(date, WIB_TIMEZONE, "d MMMM yyyy, HH:mm 'WIB'", { locale: id });
}

export function eventStartToUtc(date: string, startTime: string) {
  return fromZonedTime(`${date}T${startTime}:00`, WIB_TIMEZONE).toISOString();
}

export function eventEndToUtc(date: string, endTime: string) {
  return fromZonedTime(`${date}T${endTime}:00`, WIB_TIMEZONE).toISOString();
}

export type EventStatusValue = "draft" | "aktif" | "selesai" | "dibatalkan";

/**
 * Effective event status derived from its WIB schedule:
 * before start -> "draft", within [start, end] -> "aktif", after end -> "selesai".
 * A manually "dibatalkan" event is terminal and never recomputed.
 */
export function resolveEventStatus(
  date: string,
  startTime: string,
  endTime: string,
  storedStatus?: string | null,
  now: Date = new Date()
): EventStatusValue {
  if (storedStatus === "dibatalkan") return "dibatalkan";
  const start = new Date(eventStartToUtc(date, startTime)).getTime();
  const end = new Date(eventEndToUtc(date, endTime)).getTime();
  const current = now.getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end)) return "draft";
  if (current < start) return "draft";
  if (current > end) return "selesai";
  return "aktif";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("62")) return `+${digits}`;
  if (digits.startsWith("0")) return `+62${digits.slice(1)}`;
  return value;
}

export function toCsv(rows: Array<Record<string, string | number | undefined | null>>) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | undefined | null) => {
    const text = value == null ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  };
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
}

export function parseQrToken(raw: string) {
  try {
    const url = new URL(raw);
    return url.searchParams.get("token") || raw.trim();
  } catch {
    return raw.trim();
  }
}
