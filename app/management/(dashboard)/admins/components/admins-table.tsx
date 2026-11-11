"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/management/data-table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { t } from "@/lib/i18n/admin";
import { AdminCellActions } from "./cell-actions";

export type AdminColumn = {
  id: string;
  email: string;
  name: string;
  image: string | null;
  role: "owner" | "admin";
  status: "invited" | "active" | "disabled";
  lastLoginAt: string;
  inviteExpired: boolean;
  isMe: boolean;
};

const STATUS_LABEL: Record<AdminColumn["status"], string> = {
  invited: t.admins.statusInvited,
  active: t.admins.statusActive,
  disabled: t.admins.statusDisabled,
};

function statusVariant(status: AdminColumn["status"]): "default" | "secondary" | "outline" | "destructive" {
  if (status === "active") return "default";
  if (status === "invited") return "outline";
  return "destructive";
}

export function AdminsTable({ data, isOwner }: { data: AdminColumn[]; isOwner: boolean }) {
  const columns: ColumnDef<AdminColumn>[] = [
    {
      accessorKey: "email",
      header: t.admins.email,
      cell: ({ row }) => {
        const a = row.original;
        return (
          <div className="flex items-center gap-3">
            <Avatar className="size-8">
              {a.image ? <AvatarImage src={a.image} alt="" /> : null}
              <AvatarFallback>{(a.name || a.email).slice(0, 1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-medium">
                {a.name || "—"}
                {a.isMe ? <span className="ml-1 text-xs font-normal text-muted-foreground">{t.admins.you}</span> : null}
              </span>
              <span className="text-xs text-muted-foreground">{a.email}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: t.admins.role,
      cell: ({ row }) => (
        <Badge variant={row.original.role === "owner" ? "default" : "secondary"}>
          {row.original.role === "owner" ? t.admins.roleOwner : t.admins.roleAdmin}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: t.admins.status,
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(row.original.status)}>{STATUS_LABEL[row.original.status]}</Badge>
          {row.original.inviteExpired ? (
            <span className="text-xs text-muted-foreground">{t.invite.invalidToken}</span>
          ) : null}
        </div>
      ),
    },
    {
      accessorKey: "lastLoginAt",
      header: t.admins.lastLogin,
      cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.original.lastLoginAt}</span>,
    },
    ...(isOwner
      ? [
          {
            id: "actions",
            cell: ({ row }) => <AdminCellActions data={row.original} />,
          } satisfies ColumnDef<AdminColumn>,
        ]
      : []),
  ];

  return <DataTable columns={columns} data={data} searchKey="email" searchPlaceholder={t.common.search} pageSize={50} />;
}
