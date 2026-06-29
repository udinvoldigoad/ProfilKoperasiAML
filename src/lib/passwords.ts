import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 120_000;
const KEY_LENGTH = 32;
const DIGEST = "sha256";
const PREFIX = "pbkdf2";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("base64url");
  return `${PREFIX}$${DIGEST}$${ITERATIONS}$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash?: string | null) {
  if (!storedHash) return false;
  const [prefix, digest, iterationsRaw, salt, hash] = storedHash.split("$");
  const iterations = Number(iterationsRaw);
  if (prefix !== PREFIX || digest !== DIGEST || !Number.isFinite(iterations) || !salt || !hash) return false;

  const expected = Buffer.from(hash, "base64url");
  const actual = pbkdf2Sync(password, salt, iterations, expected.length, digest).toString("base64url");
  const actualBuffer = Buffer.from(actual, "base64url");

  if (actualBuffer.length !== expected.length) return false;
  return timingSafeEqual(actualBuffer, expected);
}