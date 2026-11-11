"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { acceptInvite } from "@/actions/admins";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";
import { setPasswordSchema, type SetPasswordInput } from "@/lib/validation/admin";

export function SetPasswordForm({ token, email }: { token: string; email: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SetPasswordInput>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { token, password: "", passwordConfirm: "" },
  });

  const onSubmit = (values: SetPasswordInput) => {
    startTransition(async () => {
      const result = await acceptInvite(values);
      if (!result.ok) {
        if (result.field) form.setError(result.field as keyof SetPasswordInput, { message: result.error });
        toast.error(result.error);
        return;
      }
      toast.success(t.invite.done);
      router.push("/management/login");
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5">
      <FieldGroup>
        <Field>
          <FieldLabel>{t.invite.emailLabel}</FieldLabel>
          <Input value={email} readOnly disabled />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.password) || undefined}>
          <FieldLabel htmlFor="password">{t.invite.password}</FieldLabel>
          <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} disabled={pending} />
          <FieldDescription>{t.invite.passwordHint}</FieldDescription>
          <FieldError errors={[form.formState.errors.password]} />
        </Field>
        <Field data-invalid={Boolean(form.formState.errors.passwordConfirm) || undefined}>
          <FieldLabel htmlFor="passwordConfirm">{t.invite.passwordConfirm}</FieldLabel>
          <Input
            id="passwordConfirm"
            type="password"
            autoComplete="new-password"
            {...form.register("passwordConfirm")}
            disabled={pending}
          />
          <FieldError errors={[form.formState.errors.passwordConfirm]} />
        </Field>
      </FieldGroup>
      <Button type="submit" disabled={pending} className="w-full">
        {t.invite.submit}
      </Button>
    </form>
  );
}
