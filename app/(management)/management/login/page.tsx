import type { Metadata } from "next";
import { Suspense } from "react";
import { isGoogleLoginEnabled } from "@/auth.config";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n/admin";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: t.login.title };

async function LoginFormLoader({ searchParams }: Pick<PageProps<"/management/login">, "searchParams">) {
  const params = await searchParams;
  const callbackUrl = typeof params.callbackUrl === "string" ? params.callbackUrl : "/management";
  const authError = typeof params.error === "string" ? params.error : undefined;

  return <LoginForm callbackUrl={callbackUrl} googleEnabled={isGoogleLoginEnabled()} authError={authError} />;
}

export default function LoginPage({ searchParams }: PageProps<"/management/login">) {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">{t.login.title}</CardTitle>
          <CardDescription>{t.login.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense
            fallback={
              <div className="space-y-5">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            }
          >
            <LoginFormLoader searchParams={searchParams} />
          </Suspense>
        </CardContent>
      </Card>
    </main>
  );
}
