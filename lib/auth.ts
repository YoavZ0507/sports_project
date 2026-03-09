import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/authStore";
import type { Locale } from "@/lib/types";

export interface SessionContext {
  userId: string;
  role: "coach" | "athlete";
  locale: Locale;
}

export async function getSessionFromHeaders(): Promise<SessionContext> {
  const headerStore = await headers();
  const tokenFromHeader = headerStore.get("x-session-token");
  if (tokenFromHeader) {
    const headerSession = getSession(tokenFromHeader);
    if (headerSession) {
      return {
        userId: headerSession.userId,
        role: headerSession.role,
        locale: headerSession.locale
      };
    }
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) {
    throw new Error("unauthorized");
  }

  const session = getSession(token);
  if (!session) {
    throw new Error("unauthorized");
  }

  return {
    userId: session.userId,
    role: session.role,
    locale: session.locale
  };
}

export async function getSessionFromCookie(): Promise<SessionContext | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_session")?.value;
  if (!token) return null;

  const session = getSession(token);
  if (!session) return null;

  return {
    userId: session.userId,
    role: session.role,
    locale: session.locale
  };
}

export async function requireRole(
  locale: string,
  role: "coach" | "athlete"
): Promise<SessionContext> {
  const session = await getSessionFromCookie();
  if (!session) {
    redirect(`/${locale}/auth?role=${role}`);
  }

  if (session.role !== role) {
    const fallback = session.role === "coach" ? "coach/dashboard" : "athlete/dashboard";
    redirect(`/${locale}/${fallback}`);
  }

  return session;
}
