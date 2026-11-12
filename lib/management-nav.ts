import { FolderTreeIcon, LayoutDashboardIcon, type LucideIcon, PackageIcon, SettingsIcon, UsersIcon } from "lucide-react";
import { t } from "@/lib/i18n/admin";

export interface NavSubItem {
  title: string;
  url: string;
}
export interface NavItem {
  title: string;
  url: string;
  icon: LucideIcon;
  items?: NavSubItem[];
}

/** Sidebar navigation; also drives the header breadcrumb. */
export const managementNav: NavItem[] = [
  { title: t.nav.dashboard, url: "/management", icon: LayoutDashboardIcon },
  {
    title: t.nav.products,
    url: "/management/products",
    icon: PackageIcon,
    items: [
      { title: t.products.filterAll, url: "/management/products" },
      { title: t.products.addNew, url: "/management/products/new" },
    ],
  },
  {
    title: t.nav.categories,
    url: "/management/categories",
    icon: FolderTreeIcon,
    items: [
      { title: t.products.filterAll, url: "/management/categories" },
      { title: t.categories.addNew, url: "/management/categories/new" },
    ],
  },
  { title: t.nav.admins, url: "/management/admins", icon: UsersIcon },
  { title: t.nav.settings, url: "/management/settings", icon: SettingsIcon },
];

const EDIT_TITLES: Record<string, string> = {
  "/management/products": t.products.editTitle,
  "/management/categories": t.categories.editTitle,
};

export type Crumb = { title: string; url?: string };

/** Breadcrumb for a pathname: section → sub page (list / new / edit). */
export function getBreadcrumbs(pathname: string): Crumb[] {
  const item = [...managementNav]
    .sort((a, b) => b.url.length - a.url.length)
    .find((i) => pathname === i.url || pathname.startsWith(`${i.url}/`));
  if (!item) return [];
  if (pathname === item.url) return [{ title: item.title }];

  const sub = item.items?.find((s) => s.url === pathname && s.url !== item.url);
  if (sub) return [{ title: item.title, url: item.url }, { title: sub.title }];

  const edit = EDIT_TITLES[item.url];
  return [{ title: item.title, url: item.url }, { title: edit ?? item.title }];
}

export function isNavActive(pathname: string, url: string, exact = false) {
  return exact ? pathname === url : pathname === url || pathname.startsWith(`${url}/`);
}
