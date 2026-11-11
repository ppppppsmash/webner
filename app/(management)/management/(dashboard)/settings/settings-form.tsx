"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n/admin";
import { siteSettingsSchema, type SiteSettings, type SiteSettingsInput } from "@/lib/settings/schema";

export function SettingsForm({ initialData }: { initialData: SiteSettings }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const form = useForm<SiteSettingsInput>({
    resolver: zodResolver(siteSettingsSchema),
    defaultValues: initialData,
  });

  const onSubmit = (values: SiteSettingsInput) => {
    startTransition(async () => {
      const result = await updateSiteSettings(values);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.settings.saved);
      router.refresh();
    });
  };

  const errors = form.formState.errors;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <Card>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.siteName) || undefined}>
              <FieldLabel htmlFor="siteName">{t.settings.siteName}</FieldLabel>
              <Input id="siteName" {...form.register("siteName")} disabled={pending} />
              <FieldError errors={[errors.siteName]} />
            </Field>

            <Controller
              control={form.control}
              name="showShopLink"
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>{t.settings.shopLink}</FieldTitle>
                    <FieldDescription>{t.settings.shopLinkHint}</FieldDescription>
                  </FieldContent>
                  <Switch checked={field.value ?? false} onCheckedChange={field.onChange} disabled={pending} />
                </Field>
              )}
            />

            <Field data-invalid={Boolean(errors.shopUrl) || undefined}>
              <FieldLabel htmlFor="shopUrl">{t.settings.shopUrl}</FieldLabel>
              <Input id="shopUrl" type="url" {...form.register("shopUrl")} disabled={pending} />
              <FieldDescription>{t.settings.shopUrlHint}</FieldDescription>
              <FieldError errors={[errors.shopUrl]} />
            </Field>
          </FieldGroup>
        </CardContent>
      </Card>
      <Button type="submit" disabled={pending}>
        {t.common.save}
      </Button>
    </form>
  );
}
