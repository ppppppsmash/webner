"use client";

import Link from "next/link";
import { Suspense } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { t } from "@/lib/i18n/admin";
import { managementNav } from "@/lib/management-nav";
import { NavMain } from "./nav-main";

export function AppSidebar({ userSlot, ...props }: React.ComponentProps<typeof Sidebar> & { userSlot?: React.ReactNode }) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[slot=sidebar-menu-button]:p-1.5!" render={<Link href="/management" />}>
              <span className="flex aspect-square size-8 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                W
              </span>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">{t.app.name}</span>
                <span className="truncate text-xs text-muted-foreground">webner 葦柏納</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {/* usePathname() is runtime data: stream the active state in behind a boundary. */}
        <Suspense
          fallback={
            <div className="flex flex-col gap-1 p-2">
              {managementNav.map((item) => (
                <Skeleton key={item.url} className="h-8 w-full rounded-md" />
              ))}
            </div>
          }
        >
          <NavMain />
        </Suspense>
      </SidebarContent>
      <SidebarFooter>{userSlot}</SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
