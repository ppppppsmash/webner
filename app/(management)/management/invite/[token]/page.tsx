import type { Metadata } from "next";
import { Suspense } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n/admin";
import { findAdminByInviteToken } from "@/lib/queries/admins";
import { SetPasswordForm } from "./set-password-form";

export const metadata: Metadata = { title: t.invite.title };

async function InviteLoader({ params }: Pick<PageProps<"/management/invite/[token]">, "params">) {
  const { token } = await params;
  const admin = /^[a-f0-9]{64}$/.test(token) ? await findAdminByInviteToken(token) : undefined;
  const valid = Boolean(admin && admin.status !== "disabled" && admin.inviteExpiresAt && admin.inviteExpiresAt > new Date());

  if (!valid) {
    return <p className="text-sm text-destructive">{t.invite.invalidToken}</p>;
  }
  return <SetPasswordForm token={token} email={admin!.email} />;
}

export default function InvitePage({ params }: PageProps<"/management/invite/[token]">) {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t.invite.title}</CardTitle>
          <CardDescription>{t.invite.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<Skeleton className="h-40 w-full" />}>
            <InviteLoader params={params} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
