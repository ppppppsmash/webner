"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/settings";
import { SingleImageField } from "@/components/management/single-image-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n/admin";
import { DEFAULT_SITE_THEME } from "@/lib/site-themes";
import { ThemeField } from "./theme-field";
import { DEFAULT_SITE_NAME, DEFAULT_SITE_NAME_COLOR, siteSettingsSchema, type SiteSettings, type SiteSettingsInput } from "@/lib/settings/schema";

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
  const siteName = useWatch({ control: form.control, name: "siteName" });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      <Card>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.siteName) || undefined}>
              <FieldLabel htmlFor="siteName">{t.settings.siteName}</FieldLabel>
              <Input id="siteName" {...form.register("siteName")} disabled={pending} />
              <FieldDescription>{t.settings.siteNameHint}</FieldDescription>
              <FieldError errors={[errors.siteName]} />
            </Field>

            <Controller
              control={form.control}
              name="siteNameColor"
              render={({ field }) => {
                const value = field.value ?? DEFAULT_SITE_NAME_COLOR;
                // The colour well only understands a complete #rrggbb; while a code is being typed it keeps the default.
                const swatch = /^#[0-9a-fA-F]{6}$/.test(value) ? value : DEFAULT_SITE_NAME_COLOR;
                return (
                  <Field data-invalid={Boolean(errors.siteNameColor) || undefined}>
                    <FieldLabel htmlFor="siteNameColor">{t.settings.siteNameColor}</FieldLabel>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        aria-label={t.settings.siteNameColor}
                        value={swatch}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={pending}
                        className="size-9 shrink-0 cursor-pointer rounded-md border bg-transparent p-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                      <Input
                        id="siteNameColor"
                        value={value}
                        onChange={(e) => field.onChange(e.target.value)}
                        onBlur={field.onBlur}
                        disabled={pending}
                        maxLength={7}
                        spellCheck={false}
                        className="w-28 font-mono"
                      />
                      <span className="px-2 text-xl font-extrabold tracking-tight" style={{ color: swatch }}>
                        {siteName || DEFAULT_SITE_NAME}
                      </span>
                      {value.toLowerCase() !== DEFAULT_SITE_NAME_COLOR ? (
                        <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={() => field.onChange(DEFAULT_SITE_NAME_COLOR)}>
                          {t.settings.siteNameColorReset}
                        </Button>
                      ) : null}
                    </div>
                    <FieldDescription>{t.settings.siteNameColorHint}</FieldDescription>
                    <FieldError errors={[errors.siteNameColor]} />
                  </Field>
                );
              }}
            />

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

            <Controller
              control={form.control}
              name="heroImageUrl"
              render={({ field }) => (
                <Field>
                  <FieldLabel>{t.settings.heroImage}</FieldLabel>
                  <SingleImageField value={field.value ?? ""} onChange={field.onChange} disabled={pending} />
                  <FieldDescription>{t.settings.heroImageHint}</FieldDescription>
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="siteTheme"
              render={({ field }) => (
                <Field>
                  <FieldTitle>{t.settings.theme}</FieldTitle>
                  <ThemeField value={field.value ?? DEFAULT_SITE_THEME} onChange={field.onChange} disabled={pending} />
                  <FieldDescription>{t.settings.themeHint}</FieldDescription>
                  <FieldError errors={[errors.siteTheme]} />
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
