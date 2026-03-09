import { headers } from "next/headers";
import type { Locale } from "@/lib/types";

export interface SessionContext {
  userId: string;
  role: "coach" | "athlete";
  locale: Locale;
}

export async function getSessionFromHeaders(): Promise<SessionContext> {
  const headerStore = await headers();
  return {
    userId: headerStore.get("x-user-id") ?? "coach_demo",
    role: (headerStore.get("x-user-role") as "coach" | "athlete") ?? "coach",
    locale: (headerStore.get("x-locale") as Locale) ?? "en"
  };
}
