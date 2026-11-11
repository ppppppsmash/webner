import Link from "next/link";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n/admin";
import { MainNav } from "./main-nav";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

export function Navbar() {
  return (
    <header className="border-b bg-background">
      <div className="flex h-14 items-center gap-6 px-4 md:px-8">
        <Link href="/management" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex size-7 items-center justify-center rounded-md bg-primary text-xs font-bold text-primary-foreground">
            W
          </span>
          <span className="hidden sm:inline">{t.app.name}</span>
        </Link>
        <MainNav />
        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          <Suspense fallback={<Skeleton className="size-8 rounded-full" />}>
            <UserMenu />
          </Suspense>
        </div>
      </div>
    </header>
  );
}
