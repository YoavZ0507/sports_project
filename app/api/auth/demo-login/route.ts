import { z } from "zod";
import { NextResponse } from "next/server";
import { createSystemTestSession } from "@/lib/authStore";

const schema = z.object({
  role: z.enum(["coach", "athlete"]),
  locale: z.enum(["he", "en"]).default("he")
});

export async function POST(request: Request) {
  try {
    const body = schema.parse(await request.json());
    const session = createSystemTestSession(body.role, body.locale);

    const response = NextResponse.json({
      data: {
        role: session.role,
        nextPath: `/${body.locale}/${session.role === "coach" ? "coach/dashboard" : "athlete/dashboard"}`
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
    const message = error instanceof Error ? error.message : "demo login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
