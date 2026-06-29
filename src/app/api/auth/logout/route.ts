import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/session";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/login";
  return value;
}

/** Logout is a POST action so it is never triggered by Next.js prefetching. */
export async function POST(request: NextRequest) {
  const formNext = (await request.formData().catch(() => null))?.get("next");
  const next = safeNext(typeof formNext === "string" ? formNext : request.nextUrl.searchParams.get("next"));

  const response = new NextResponse(null, { status: 303, headers: { Location: next } });
  clearSessionCookie(response);
  return response;
}
