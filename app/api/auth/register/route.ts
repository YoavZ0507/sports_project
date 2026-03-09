import { z } from "zod";
import { NextResponse } from "next/server";
import { createAccount, createSessionForAccount } from "@/lib/authStore";
import { TEAMS } from "@/lib/teams";

const schema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  username: z.string().min(3).max(24),
  password: z.string().min(8),
  role: z.enum(["coach", "athlete"]),
  team: z.string().refine((value) => TEAMS.includes(value as (typeof TEAMS)[number]), "invalid team"),
  locale: z.enum(["he", "en"]).default("he")
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const account = createAccount(body);
    const session = createSessionForAccount(account);

    const response = NextResponse.json({
      data: {
        userId: account.userId,
        role: account.role,
        nextPath: `/${body.locale}/${account.role === "coach" ? "coach/dashboard" : "athlete/dashboard"}`
      }
    });

    response.cookies.set("auth_session", session.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "registration failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
