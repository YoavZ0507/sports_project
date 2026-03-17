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
    return buildSessionJsonResponse(body.role, body.locale);
  } catch (error) {
    const message = error instanceof Error ? error.message : "demo login failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const body = schema.parse({
      role: searchParams.get("role"),
      locale: searchParams.get("locale") ?? "he"
    });

    return buildSessionRedirectResponse(body.role, body.locale, request.url);
  } catch {
    return NextResponse.redirect(new URL("/he", request.url));
  }
}

function setSessionCookie(response: NextResponse, token: string) {
  response.cookies.set("auth_session", token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8
  });
}

function buildSessionJsonResponse(role: "coach" | "athlete", locale: "he" | "en") {
  const session = createSystemTestSession(role, locale);
  const response = NextResponse.json({
    data: {
      role: session.role,
      nextPath: `/${locale}/${session.role === "coach" ? "coach/dashboard" : "athlete/dashboard"}`
    }
  });

  setSessionCookie(response, session.token);
  return response;
}

function buildSessionRedirectResponse(role: "coach" | "athlete", locale: "he" | "en", requestUrl: string) {
  const session = createSystemTestSession(role, locale);
  const nextPath = `/${locale}/${session.role === "coach" ? "coach/dashboard" : "athlete/dashboard"}`;
  const response = NextResponse.redirect(new URL(nextPath, requestUrl));
  setSessionCookie(response, session.token);
  return response;
}
