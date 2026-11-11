import { z } from "zod";
import { SLUG_PATTERN } from "@/lib/slug";
import { hasAnyText, localizedTextSchema } from "./localized";
import { t } from "@/lib/i18n/admin";

export const categoryFormSchema = z.object({
  id: z.uuid().optional(),
  name: localizedTextSchema.refine(hasAnyText, { message: t.categories.nameRequired }),
  slug: z
    .string()
    .trim()
    .max(80)
    .refine((v) => v === "" || SLUG_PATTERN.test(v), { message: t.common.slugHint })
    .default(""),
  parentId: z.uuid().nullable().default(null),
  sortOrder: z.number().int().min(0).max(100000).default(0),
});

export type CategoryFormInput = z.input<typeof categoryFormSchema>;
export type CategoryFormValues = z.output<typeof categoryFormSchema>;
