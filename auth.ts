import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";
import { activateByGoogle, findAdminByEmail, markLogin } from "./lib/auth/admins";

const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    ...authConfig.providers,
    Credentials({
      credentials: {
        email: { type: "email" },
        password: { type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const admin = await findAdminByEmail(parsed.data.email);
        if (!admin || admin.status !== "active" || !admin.passwordHash) return null;

        const ok = await bcrypt.compare(parsed.data.password, admin.passwordHash);
        if (!ok) return null;

        await markLogin(admin.id);
        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          image: admin.image,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ account, profile, user }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email;
      if (!email) return false;

      // Allow-list: only invited admins may log in with Google.
      const admin = await findAdminByEmail(email);
      if (!admin || admin.status === "disabled") return false;

      if (admin.status === "invited") {
        await activateByGoogle(admin.id, { name: profile?.name, image: profile?.picture as string | undefined });
      } else {
        await markLogin(admin.id, { name: profile?.name, image: profile?.picture as string | undefined });
      }

      // Hand the database identity to the jwt callback.
      user.id = admin.id;
      user.role = admin.role;
      return true;
    },
  },
});
