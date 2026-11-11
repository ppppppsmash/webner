import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function findAdminByEmail(email: string) {
  return db.query.admins.findFirst({ where: eq(admins.email, normalizeEmail(email)) });
}

export async function findAdminById(id: string) {
  return db.query.admins.findFirst({ where: eq(admins.id, id) });
}

export async function markLogin(id: string, patch: { name?: string | null; image?: string | null } = {}) {
  await db
    .update(admins)
    .set({
      lastLoginAt: new Date(),
      ...(patch.name ? { name: patch.name } : {}),
      ...(patch.image ? { image: patch.image } : {}),
    })
    .where(eq(admins.id, id));
}

/** First Google login of an invited admin activates the account. */
export async function activateByGoogle(id: string, profile: { name?: string | null; image?: string | null }) {
  await db
    .update(admins)
    .set({
      status: "active",
      inviteToken: null,
      inviteExpiresAt: null,
      lastLoginAt: new Date(),
      ...(profile.name ? { name: profile.name } : {}),
      ...(profile.image ? { image: profile.image } : {}),
    })
    .where(eq(admins.id, id));
}
