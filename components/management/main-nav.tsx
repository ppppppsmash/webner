"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { t } from "@/lib/i18n/admin";

const routes = [
  { href: "/management", label: t.nav.dashboard, exact: true },
  { href: "/management/products", label: t.nav.products },
  { href: "/management/categories", label: t.nav.categories },
  { href: "/management/admins", label: t.nav.admins },
  { href: "/management/settings", label: t.nav.settings },
] as const;

/** Presentational list; `pathname` is null while the URL is not known yet (static shell). */
export function MainNavLinks({ pathname, className }: { pathname: string | null; className?: string }) {
  return (
    <nav className={cn("flex items-center gap-4 lg:gap-6", className)}>
      {routes.map((route) => {
        const active =
          pathname !== null &&
          ("exact" in route && route.exact ? pathname === route.href : pathname.startsWith(route.href));
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              active ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {route.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function MainNav({ className }: { className?: string }) {
  const pathname = usePathname();
  return <MainNavLinks pathname={pathname} className={className} />;
}
