"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";
import { loginRateLimiter } from "@/lib/loginRateLimit";

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const username = formData.get("username");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  const rateLimitKey = typeof username === "string" ? username.trim() : "";

  const decision = loginRateLimiter.check(rateLimitKey);
  if (decision.blocked) {
    const retryMinutes = Math.max(1, Math.ceil(decision.retryAfterMs / 60_000));
    return {
      error: `พยายามเข้าสู่ระบบมากเกินไป กรุณาลองใหม่ในอีก ${retryMinutes} นาที`,
    };
  }

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/",
    });
    loginRateLimiter.recordSuccess(rateLimitKey);
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      loginRateLimiter.recordFailure(rateLimitKey);
      return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    // On success signIn throws Next.js's NEXT_REDIRECT instead of returning,
    // so the failure history must be cleared here before rethrowing.
    if (isNextRedirect(error)) {
      loginRateLimiter.recordSuccess(rateLimitKey);
    }
    throw error;
  }
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    typeof error.digest === "string" &&
    error.digest.startsWith("NEXT_REDIRECT")
  );
}
