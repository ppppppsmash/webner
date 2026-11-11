"use server";

import bcrypt from "bcryptjs";
import { and, eq, gt } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { normalizeEmail } from "@/lib/auth/admins";
import { requireAdmin, requireOwner } from "@/lib/auth/guard";
import { t } from "@/lib/i18n/admin";
import { countAdmins } from "@/lib/queries/admins";
import {
  ADMIN_LIMIT,
  INVITE_TTL_MS,
  inviteAdminSchema,
  setPasswordSchema,
  type InviteAdminInput,
  type SetPasswordInput,
} from "@/lib/validation/admin";

const PATH = "/management/admins";

const newToken = () => crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");

function inviteUrl(token: string) {
  const base = process.env.AUTH_URL?.replace(/\/$/, "") || "http://localhost:3000";
  return `${base}/management/invite/${token}`;
}

/** Owner-only: adds an email to the allow-list and returns the invitation link. */
export async function inviteAdmin(input: InviteAdminInput): Promise<ActionResult<{ id: string; inviteUrl: string }>> {
  const me = await requireOwner();

  const parsed = inviteAdminSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? t.common.somethingWentWrong, issue?.path.join("."));
  }
  const email = normalizeEmail(parsed.data.email);

  if ((await countAdmins()) >= ADMIN_LIMIT) return fail(t.admins.limitReached);
  const exists = await db.query.admins.findFirst({ where: eq(admins.email, email), columns: { id: true } });
  if (exists) return fail(t.admins.emailExists, "email");

  const token = newToken();
  const [row] = await db
    .insert(admins)
    .values({
      email,
      name: parsed.data.name || null,
      role: parsed.data.role,
      status: "invited",
      inviteToken: token,
      inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS),
      invitedById: me.id,
    })
    .returning({ id: admins.id });

  revalidatePath(PATH);
  return ok({ id: row.id, inviteUrl: inviteUrl(token) });
}

/** Owner-only: issues a fresh invitation link (for invited accounts, or to let an active user reset a password). */
export async function regenerateInvite(id: string): Promise<ActionResult<{ inviteUrl: string }>> {
  await requireOwner();
  const target = await db.query.admins.findFirst({ where: eq(admins.id, id) });
  if (!target) return fail(t.common.somethingWentWrong);
  if (target.status === "disabled") return fail(t.admins.statusDisabled);

  const token = newToken();
  await db
    .update(admins)
    .set({ inviteToken: token, inviteExpiresAt: new Date(Date.now() + INVITE_TTL_MS) })
    .where(eq(admins.id, id));
  revalidatePath(PATH);
  return ok({ inviteUrl: inviteUrl(token) });
}

export async function setAdminStatus(id: string, status: "active" | "disabled"): Promise<ActionResult> {
  const me = await requireOwner();
  if (id === me.id) return fail(t.admins.cannotEditSelf);
  const target = await db.query.admins.findFirst({ where: eq(admins.id, id) });
  if (!target) return fail(t.common.somethingWentWrong);
  if (target.role === "owner") return fail(t.admins.cannotEditOwner);

  await db.update(admins).set({ status }).where(eq(admins.id, id));
  revalidatePath(PATH);
  return ok(undefined);
}

export async function deleteAdmin(id: string): Promise<ActionResult> {
  const me = await requireOwner();
  if (id === me.id) return fail(t.admins.cannotEditSelf);
  const target = await db.query.admins.findFirst({ where: eq(admins.id, id) });
  if (!target) return ok(undefined);
  if (target.role === "owner") return fail(t.admins.cannotEditOwner);

  await db.delete(admins).where(eq(admins.id, id));
  revalidatePath(PATH);
  return ok(undefined);
}

/** Public (token-protected): sets the password and activates the account. */
export async function acceptInvite(input: SetPasswordInput): Promise<ActionResult> {
  const parsed = setPasswordSchema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(issue?.message ?? t.common.somethingWentWrong, issue?.path.join("."));
  }

  const target = await db.query.admins.findFirst({
    where: and(eq(admins.inviteToken, parsed.data.token), gt(admins.inviteExpiresAt, new Date())),
  });
  if (!target || target.status === "disabled") return fail(t.invite.invalidToken);

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  await db
    .update(admins)
    .set({ passwordHash, status: "active", inviteToken: null, inviteExpiresAt: null })
    .where(eq(admins.id, target.id));

  return ok(undefined);
}

/** Any admin may read their own role; used to hide owner-only controls. */
export async function currentAdminRole() {
  const me = await requireAdmin();
  return me.role;
}
