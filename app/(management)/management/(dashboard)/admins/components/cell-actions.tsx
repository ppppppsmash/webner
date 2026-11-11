"use client";

import { BanIcon, CheckCircle2Icon, LinkIcon, MoreHorizontalIcon, TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { deleteAdmin, regenerateInvite, setAdminStatus } from "@/actions/admins";
import { AlertModal } from "@/components/management/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { t } from "@/lib/i18n/admin";
import type { AdminColumn } from "./admins-table";
import { InviteLinkDialog } from "./invite-link-dialog";

export function AdminCellActions({ data }: { data: AdminColumn }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const locked = data.isMe || data.role === "owner";

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) => {
    startTransition(async () => {
      const result = await fn();
      if (!result.ok) {
        toast.error(result.error ?? t.common.somethingWentWrong);
        return;
      }
      toast.success(success);
      setOpen(false);
      router.refresh();
    });
  };

  const onRegenerate = () => {
    startTransition(async () => {
      const result = await regenerateInvite(data.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      setInviteUrl(result.data.inviteUrl);
      router.refresh();
    });
  };

  return (
    <>
      <InviteLinkDialog url={inviteUrl} onClose={() => setInviteUrl(null)} />
      <AlertModal
        open={open}
        onOpenChange={setOpen}
        onConfirm={() => run(() => deleteAdmin(data.id), t.admins.deleted)}
        loading={pending}
      />
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={t.common.actions} />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem disabled={data.status === "disabled"} onClick={onRegenerate}>
            <LinkIcon />
            {t.admins.regenerate}
          </DropdownMenuItem>
          {data.status === "disabled" ? (
            <DropdownMenuItem disabled={locked} onClick={() => run(() => setAdminStatus(data.id, "active"), t.admins.updated)}>
              <CheckCircle2Icon />
              {t.admins.enable}
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem disabled={locked} onClick={() => run(() => setAdminStatus(data.id, "disabled"), t.admins.updated)}>
              <BanIcon />
              {t.admins.disable}
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" disabled={locked} onClick={() => setOpen(true)}>
            <TrashIcon />
            {t.admins.deleteAdmin}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
