import type { MembershipRole } from "@/lib/types";

export function requireCoach(role: MembershipRole | "coach" | "athlete"): void {
  if (role !== "coach") {
    throw new Error("forbidden: coach role required");
  }
}

export function requireAthlete(role: MembershipRole | "coach" | "athlete"): void {
  if (role !== "athlete") {
    throw new Error("forbidden: athlete role required");
  }
}
