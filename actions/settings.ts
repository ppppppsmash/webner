"use server";

import { revalidatePath, updateTag } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { requireAdmin } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { saveSiteSettings, siteSettingsSchema, type SiteSettingsInput } from "@/lib/settings";

export async function updateSiteSettings(input: SiteSettingsInput): Promise<ActionResult> {
  await requireAdmin();
  const parsed = siteSettingsSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? t.common.somethingWentWrong, issue?.path.join("."));
  }
  await saveSiteSettings(parsed.data);
  revalidatePath("/management/settings");
  updateTag(CACHE_TAGS.settings);
  return ok(undefined);
}
