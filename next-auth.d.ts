import type { DefaultSession } from "next-auth";

export type AdminRole = "owner" | "admin";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: AdminRole;
    };
  }
  interface User {
    role?: AdminRole;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: AdminRole;
  }
}
