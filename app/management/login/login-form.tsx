"use client";

import { useActionState } from "react";
import { loginWithGoogle, loginWithPassword, type LoginState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="size-4">
      <path
        fill="currentColor"
        d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.4Z"
      />
      <path
        fill="currentColor"
        d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"
        opacity=".8"
      />
      <path
        fill="currentColor"
        d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9l3.3-2.6Z"
        opacity=".6"
      />
      <path
        fill="currentColor"
        d="M12 6c1.5 0 2.8.5 3.8 1.5l2.8-2.8A10 10 0 0 0 3.1 7.5L6.4 10C7.2 7.8 9.4 6 12 6Z"
        opacity=".4"
      />
    </svg>
  );
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  AccessDenied: t.login.notInvited,
  OAuthAccountNotLinked: t.login.notInvited,
  CredentialsSignin: t.login.invalid,
};

export function LoginForm({
  callbackUrl,
  googleEnabled,
  authError,
}: {
  callbackUrl: string;
  googleEnabled: boolean;
  authError?: string;
}) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginWithPassword, undefined);
  const errorMessage = state?.error ?? (authError ? (AUTH_ERROR_MESSAGES[authError] ?? t.login.error) : undefined);

  return (
    <div className="flex flex-col gap-5">
      <form action={formAction} className="flex flex-col gap-5">
        <input type="hidden" name="callbackUrl" value={callbackUrl} />
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">{t.login.email}</FieldLabel>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              autoFocus
              defaultValue={state?.email ?? ""}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">{t.login.password}</FieldLabel>
            <Input id="password" name="password" type="password" autoComplete="current-password" required />
          </Field>
          {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
        </FieldGroup>
        <Button type="submit" disabled={pending} className="w-full">
          {t.login.submit}
        </Button>
      </form>

      {googleEnabled ? (
        <>
          <FieldSeparator>{t.login.or}</FieldSeparator>
          <form action={loginWithGoogle}>
            <input type="hidden" name="callbackUrl" value={callbackUrl} />
            <Button type="submit" variant="outline" className="w-full">
              <GoogleIcon />
              {t.login.google}
            </Button>
          </form>
        </>
      ) : null}
    </div>
  );
}
