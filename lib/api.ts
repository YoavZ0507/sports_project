import { NextResponse } from "next/server";

export function success<T>(data: T, status = 200) {
  return NextResponse.json({ data }, { status });
}

export function failure(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withApiError(handler: () => Promise<NextResponse> | NextResponse) {
  try {
    return await handler();
  } catch (error) {
    const message = error instanceof Error ? error.message : "unexpected error";
    return failure(message, 400);
  }
}
