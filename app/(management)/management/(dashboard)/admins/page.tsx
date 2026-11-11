import type { Metadata } from "next";
import { auth } from "@/auth";
import { PageHeader } from "@/components/management/page-header";
import { formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/admin";
import { listAdmins } from "@/lib/queries/admins";
import { ADMIN_LIMIT } from "@/lib/validation/admin";
import { AdminsTable, type AdminColumn } from "./components/admins-table";
import { InviteDialog } from "./components/invite-dialog";
import { PageSuspense } from "@/components/management/page-suspense";

export const metadata: Metadata = { title: t.admins.title };

async function AdminsContent() {
  const [session, rows] = await Promise.all([auth(), listAdmins()]);
  const me = session?.user;
  const isOwner = me?.role === "owner";

  const data: AdminColumn[] = rows.map((a) => ({
    id: a.id,
    email: a.email,
    name: a.name ?? "",
    image: a.image ?? null,
    role: a.role,
    status: a.status,
    lastLoginAt: a.lastLoginAt ? formatDateTime(a.lastLoginAt) : t.admins.never,
    inviteExpired: a.status === "invited" && (!a.inviteExpiresAt || a.inviteExpiresAt < new Date()),
    isMe: a.id === me?.id,
  }));

  return (
    <>
      <PageHeader
        title={t.admins.count(data.length)}
        description={t.admins.listDescription}
        action={isOwner ? <InviteDialog disabled={data.length >= ADMIN_LIMIT} /> : null}
      />
      <AdminsTable data={data} isOwner={isOwner} />
    </>
  );
}

export default function AdminsPage() {
  return (
    <PageSuspense>
      <AdminsContent />
    </PageSuspense>
  );
}
