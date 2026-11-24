"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/settings";
import { SingleImageField } from "@/components/management/single-image-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n/admin";
import { DEFAULT_SITE_THEME } from "@/lib/site-themes";
import { NameColorField } from "./name-color-field";
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
  const typedColour = useWatch({ control: form.control, name: "siteNameColor" }) ?? "";
  const logoColour = /^#[0-9a-fA-F]{6}$/.test(typedColour) ? typedColour : DEFAULT_SITE_NAME_COLOR;

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-2xl space-y-6">
      {/* 1. name and its colour, with the logo as the public site will show it */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.sectionName}</CardTitle>
          <CardDescription>{t.settings.sectionNameHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <div className="rounded-md border bg-white px-5 py-4">
              <p className="mb-2 text-xs text-neutral-500">{t.settings.logoPreview}</p>
              <span className="inline-flex flex-col leading-none">
                <span className="text-[1.9rem] font-extrabold tracking-[-0.03em] break-all" style={{ color: logoColour }}>
                  {siteName || DEFAULT_SITE_NAME}
                </span>
                <span className="mt-0.5 text-[0.58rem] font-semibold tracking-[0.32em] text-neutral-500 uppercase">Germany</span>
              </span>
            </div>

            <Field data-invalid={Boolean(errors.siteName) || undefined}>
              <FieldLabel htmlFor="siteName">{t.settings.siteName}</FieldLabel>
              <Input id="siteName" {...form.register("siteName")} disabled={pending} />
              <FieldDescription>{t.settings.siteNameHint}</FieldDescription>
              <FieldError errors={[errors.siteName]} />
            </Field>

            <Controller
              control={form.control}
              name="siteNameColor"
              render={({ field }) => (
                <Field data-invalid={Boolean(errors.siteNameColor) || undefined}>
                  <FieldLabel htmlFor="siteNameColor">{t.settings.siteNameColor}</FieldLabel>
                  <NameColorField id="siteNameColor" value={field.value ?? DEFAULT_SITE_NAME_COLOR} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} />
                  <FieldDescription>{t.settings.siteNameColorHint}</FieldDescription>
                  <FieldError errors={[errors.siteNameColor]} />
                </Field>
              )}
            />
          </FieldGroup>
        </CardContent>
      </Card>

      {/* 2. look of the public site */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.sectionLook}</CardTitle>
          <CardDescription>{t.settings.sectionLookHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
          </FieldGroup>
        </CardContent>
      </Card>

      {/* 3. link to the shop */}
      <Card>
        <CardHeader>
          <CardTitle>{t.settings.sectionShop}</CardTitle>
          <CardDescription>{t.settings.sectionShopHint}</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
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
