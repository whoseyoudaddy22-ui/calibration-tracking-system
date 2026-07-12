"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(
  _prevState: { error: string | null },
  formData: FormData,
): Promise<{ error: string | null }> {
  const username = formData.get("username");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl");

  try {
    await signIn("credentials", {
      username,
      password,
      redirectTo: typeof callbackUrl === "string" && callbackUrl ? callbackUrl : "/",
    });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" };
    }
    throw error;
  }
}
