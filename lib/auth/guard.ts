import "server-only";
import { auth } from "@/auth";
import { t } from "@/lib/i18n/admin";

export class UnauthorizedError extends Error {
  constructor() {
    super(t.common.unauthorized);
    this.name = "UnauthorizedError";
  }
}

/** Every server action must call this first: render-time gating is not a security boundary. */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) throw new UnauthorizedError();
  return session.user;
}

export async function requireOwner() {
  const user = await requireAdmin();
  if (user.role !== "owner") throw new UnauthorizedError();
  return user;
}
