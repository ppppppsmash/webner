import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { t } from "@/lib/i18n/admin";

export function BackLink({ href, label = t.common.back }: { href: string; label?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      <ChevronLeftIcon className="size-4" />
      {label}
    </Link>
  );
}
