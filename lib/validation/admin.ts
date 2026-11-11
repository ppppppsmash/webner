import { z } from "zod";
import { t } from "@/lib/i18n/admin";

export const inviteAdminSchema = z.object({
  email: z.email().max(254),
  name: z.string().trim().max(100).default(""),
  role: z.enum(["owner", "admin"]).default("admin"),
});
export type InviteAdminInput = z.input<typeof inviteAdminSchema>;

export const setPasswordSchema = z
  .object({
    token: z.string().min(10).max(200),
    password: z.string().min(8).max(200),
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, { message: t.invite.mismatch, path: ["passwordConfirm"] });
export type SetPasswordInput = z.input<typeof setPasswordSchema>;

export const ADMIN_LIMIT = 10;
export const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
