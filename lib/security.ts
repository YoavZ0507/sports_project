import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEYLEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEYLEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;

  const candidate = scryptSync(password, salt, KEYLEN);
  const original = Buffer.from(hash, "hex");
  if (candidate.length !== original.length) return false;

  return timingSafeEqual(candidate, original);
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function isEnglishUsername(username: string): boolean {
  return /^[a-zA-Z0-9._-]{3,24}$/.test(username);
}
