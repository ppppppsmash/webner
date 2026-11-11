/**
 * Creates (or updates) the first owner account from env:
 *   SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME
 * Usage: pnpm seed:admin
 */
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "../db";
import { admins } from "../db/schema";

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  const name = process.env.SEED_ADMIN_NAME?.trim() || "Owner";

  if (!email || !password) {
    throw new Error("SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD must be set in .env");
  }
  if (password.length < 8) {
    throw new Error("SEED_ADMIN_PASSWORD must be at least 8 characters");
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const existing = await db.query.admins.findFirst({ where: eq(admins.email, email) });

  if (existing) {
    await db
      .update(admins)
      .set({ passwordHash, name, role: "owner", status: "active", inviteToken: null, inviteExpiresAt: null })
      .where(eq(admins.id, existing.id));
    console.log(`Updated owner account: ${email}`);
  } else {
    await db.insert(admins).values({ email, name, passwordHash, role: "owner", status: "active" });
    console.log(`Created owner account: ${email}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
