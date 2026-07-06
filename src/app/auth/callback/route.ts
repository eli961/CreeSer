import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Adonde Google redirige después de que la alumna autoriza el login.
 * Intercambia el código OAuth por una sesión y la manda de regreso a
 * donde estaba (guardado en "next").
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/";

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
