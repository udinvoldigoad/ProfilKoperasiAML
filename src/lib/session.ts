import type { NextResponse } from "next/server";
import type { Role } from "@/lib/auth-roles";

export const SESSION_COOKIE = "aml_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionClaims = {
  profileId: string;
  role: Role;
  email: string | null;
  memberId: string | null;
  memberStatus: string | null;
  mustChangePassword: boolean;
  iat: number;
  exp: number;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function sessionSecret() {
  const value = process.env.AUTH_SECRET || process.env.SESSION_SECRET || process.env.NEXTAUTH_SECRET;
  if (value) return value;
  if (process.env.NODE_ENV === "production") return null;
  return "dev-only-aml-session-secret-change-in-production";
}

function bytesToBase64Url(bytes: Uint8Array) {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function encodeJson(value: unknown) {
  return bytesToBase64Url(encoder.encode(JSON.stringify(value)));
}

function decodeJson<T>(value: string): T | null {
  try {
    return JSON.parse(decoder.decode(base64UrlToBytes(value))) as T;
  } catch {
    return null;
  }
}

async function hmacKey(secret: string) {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

async function sign(data: string, secret: string) {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function verify(data: string, signature: string, secret: string) {
  const key = await hmacKey(secret);
  return crypto.subtle.verify("HMAC", key, base64UrlToBytes(signature), encoder.encode(data));
}

export async function signSession(payload: Omit<SessionClaims, "iat" | "exp">, maxAge = SESSION_MAX_AGE_SECONDS) {
  const secret = sessionSecret();
  if (!secret) throw new Error("AUTH_SECRET/SESSION_SECRET wajib diisi untuk session produksi.");

  const now = Math.floor(Date.now() / 1000);
  const body = encodeJson({ ...payload, iat: now, exp: now + maxAge } satisfies SessionClaims);
  const signature = await sign(body, secret);
  return `${body}.${signature}`;
}

export async function verifySessionToken(token?: string | null): Promise<SessionClaims | null> {
  if (!token) return null;
  const secret = sessionSecret();
  if (!secret) return null;

  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  let valid = false;
  try {
    valid = await verify(body, signature, secret);
  } catch {
    return null;
  }
  if (!valid) return null;

  const claims = decodeJson<SessionClaims>(body);
  if (!claims || !claims.profileId || !claims.role || !claims.exp) return null;
  if (claims.exp < Math.floor(Date.now() / 1000)) return null;
  return claims;
}

export function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
}