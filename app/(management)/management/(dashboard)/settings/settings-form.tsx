"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateSiteSettings } from "@/actions/settings";
import { SingleImageField } from "@/components/management/single-image-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { t } from "@/lib/i18n/admin";
import { DEFAULT_SITE_THEME, SITE_THEMES } from "@/lib/site-themes";
import { siteSettingsSchema, type SiteSettings, type SiteSettingsInput } from "@/lib/settings/schema";

/** Themes in the order of the list, grouped under their heading. */
const THEME_GROUPS = [...new Set(SITE_THEMES.map((theme) => theme.group))].map((group) => ({
  group,
  themes: SITE_THEMES.filter((theme) => theme.group === group),
}));

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
                  <FieldTitle id="siteTheme-label">{t.settings.theme}</FieldTitle>
                  <FieldDescription>{t.settings.themeHint}</FieldDescription>
                  <div role="radiogroup" aria-labelledby="siteTheme-label" className="space-y-4">
                    {THEME_GROUPS.map(({ group, themes }) => (
                      <div key={group}>
                        <p className="mb-2 text-xs text-muted-foreground">{group}</p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {themes.map((theme) => (
                            <label
                              key={theme.id}
                              className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50 has-checked:border-primary has-checked:bg-muted has-focus-visible:ring-2 has-focus-visible:ring-ring has-disabled:cursor-not-allowed has-disabled:opacity-60"
                            >
                              <input
                                type="radio"
                                name="siteTheme"
                                value={theme.id}
                                checked={(field.value ?? DEFAULT_SITE_THEME) === theme.id}
                                onChange={() => field.onChange(theme.id)}
                                disabled={pending}
                                className="sr-only"
                              />
                              <span aria-hidden className="flex shrink-0 overflow-hidden rounded-sm border">
                                <span className="size-5" style={{ background: theme.deep }} />
                                <span className="size-5" style={{ background: theme.brand }} />
                                <span className="size-5" style={{ background: theme.soft }} />
                              </span>
                              <span className="min-w-0 flex-1">{theme.name}</span>
                              {theme.id === DEFAULT_SITE_THEME ? <span className="shrink-0 text-xs text-muted-foreground">{t.settings.themeDefault}</span> : null}
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
