"use server";

import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { t } from "@/lib/i18n/admin";
import { findAdminByEmail } from "@/lib/auth/admins";

export type LoginState = { error?: string; email?: string } | undefined;

function safeCallbackUrl(value: FormDataEntryValue | null): string {
  const v = typeof value === "string" ? value : "";
  return v.startsWith("/management") ? v : "/management";
}

export async function loginWithPassword(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));

  try {
    await signIn("credentials", { email, password, redirectTo });
    return undefined;
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.type === "CredentialsSignin") {
        const admin = await findAdminByEmail(email).catch(() => null);
        if (admin?.status === "disabled") return { error: t.login.disabled, email };
        if (admin?.status === "invited") return { error: t.login.notInvited, email };
        return { error: t.login.invalid, email };
      }
      return { error: t.login.error, email };
    }
    // `redirect()` throws on success; let Next.js handle it.
    throw error;
  }
}

export async function loginWithGoogle(formData: FormData) {
  const redirectTo = safeCallbackUrl(formData.get("callbackUrl"));
  await signIn("google", { redirectTo });
}

export async function logout() {
  await signOut({ redirectTo: "/management/login" });
}
