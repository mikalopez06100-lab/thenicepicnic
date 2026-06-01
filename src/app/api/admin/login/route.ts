import { NextRequest, NextResponse } from "next/server";
import { setAdminSessionCookie, verifyAdminCredentials } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as { email?: string; password?: string };
    const email = (body.email ?? "").trim();
    const password = body.password ?? "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis." },
        { status: 400 },
      );
    }

    if (!verifyAdminCredentials(email, password)) {
      return NextResponse.json(
        { error: "Identifiants incorrects." },
        { status: 401 },
      );
    }

    await setAdminSessionCookie(email);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("admin login error", error);
    return NextResponse.json(
      { error: "Connexion impossible pour le moment." },
      { status: 500 },
    );
  }
}
