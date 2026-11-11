import type { Metadata } from "next";
import { PageHeader } from "@/components/management/page-header";
import { t } from "@/lib/i18n/admin";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: t.settings.title };

export default async function SettingsPage() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <SettingsForm initialData={settings} />
    </>
  );
}
