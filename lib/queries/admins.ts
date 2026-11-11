import { asc, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";

export async function listAdmins() {
  return db.query.admins.findMany({
    columns: {
      id: true,
      email: true,
      name: true,
      image: true,
      role: true,
      status: true,
      inviteExpiresAt: true,
      lastLoginAt: true,
      createdAt: true,
    },
    orderBy: [asc(admins.createdAt)],
  });
}

export async function countAdmins() {
  const [row] = await db.select({ n: count() }).from(admins);
  return Number(row?.n ?? 0);
}

export async function findAdminByInviteToken(token: string) {
  return db.query.admins.findFirst({ where: eq(admins.inviteToken, token) });
}
