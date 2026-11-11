import type { Metadata } from "next";
import { PageHeader } from "@/components/management/page-header";
import { t } from "@/lib/i18n/admin";
import { getSiteSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";
import { PageSuspense } from "@/components/management/page-suspense";

export const metadata: Metadata = { title: t.settings.title };

async function SettingsContent() {
  const settings = await getSiteSettings();
  return (
    <>
      <PageHeader title={t.settings.title} description={t.settings.description} />
      <SettingsForm initialData={settings} />
    </>
  );
}

export default function SettingsPage() {
  return (
    <PageSuspense>
      <SettingsContent />
    </PageSuspense>
  );
}
