import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { code } = await request.json();

    // Accept code from any of the configured env vars
    const validCodes = [
      process.env.SIGNUP_CODE,
      process.env.NEXT_PUBLIC_SIGNUP_CODE,
      process.env.ADMIN_SIGNUP_CODE,
    ].filter(Boolean);

    if (validCodes.length === 0) {
      return NextResponse.json({ valid: false }, { status: 503 });
    }

    return NextResponse.json({ valid: validCodes.includes(code) });
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 });
  }
}
