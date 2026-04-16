import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    const serverCode = process.env.SIGNUP_CODE
    if (!serverCode) {
      // If no code is configured, allow signup (open registration)
      return NextResponse.json({ valid: true })
    }
    return NextResponse.json({ valid: code === serverCode })
  } catch {
    return NextResponse.json({ valid: false }, { status: 400 })
  }
}
