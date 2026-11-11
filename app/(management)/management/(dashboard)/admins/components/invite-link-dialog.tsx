"use client";

import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { t } from "@/lib/i18n/admin";

/** Shows a freshly generated invitation link with a copy button. */
export function InviteLinkDialog({ url, onClose }: { url: string | null; onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(url ?? "");
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Dialog open={Boolean(url)} onOpenChange={(open) => (!open ? onClose() : undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t.admins.inviteLink}</DialogTitle>
          <DialogDescription>{t.admins.inviteLinkHint}</DialogDescription>
        </DialogHeader>
        <div className="flex items-center gap-2">
          <Input readOnly value={url ?? ""} onFocus={(e) => e.currentTarget.select()} />
          <Button type="button" variant="outline" onClick={copy}>
            {copied ? <CheckIcon data-icon="inline-start" /> : <CopyIcon data-icon="inline-start" />}
            {copied ? t.common.copied : t.admins.copyLink}
          </Button>
        </div>
        <DialogFooter showCloseButton={false}>
          <Button type="button" onClick={onClose}>
            {t.common.confirm}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
