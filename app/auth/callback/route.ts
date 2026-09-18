import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function redirectUrl(request: Request, path: string) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base =
    !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;
  return `${base}${path}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/admin/reset-password";
  const nextPath = next.startsWith("/") ? next : "/admin/reset-password";

  const supabase = await createClient();

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash
    });
    if (!error) {
      return NextResponse.redirect(redirectUrl(request, nextPath));
    }
  }

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(redirectUrl(request, nextPath));
    }
  }

  return NextResponse.redirect(
    redirectUrl(request, "/admin/login?error=reset-link")
  );
}
