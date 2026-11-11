"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlusIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { inviteAdmin } from "@/actions/admins";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { t } from "@/lib/i18n/admin";
import { inviteAdminSchema, type InviteAdminInput } from "@/lib/validation/admin";
import { InviteLinkDialog } from "./invite-link-dialog";

const roleItems = [
  { value: "admin", label: t.admins.roleAdmin },
  { value: "owner", label: t.admins.roleOwner },
];

export function InviteDialog({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const form = useForm<InviteAdminInput>({
    resolver: zodResolver(inviteAdminSchema),
    defaultValues: { email: "", name: "", role: "admin" },
  });

  const onSubmit = (values: InviteAdminInput) => {
    startTransition(async () => {
      const result = await inviteAdmin(values);
      if (!result.ok) {
        if (result.field) form.setError(result.field as keyof InviteAdminInput, { message: result.error });
        toast.error(result.error);
        return;
      }
      toast.success(t.admins.invited);
      setOpen(false);
      form.reset();
      setInviteUrl(result.data.inviteUrl);
      router.refresh();
    });
  };

  return (
    <>
      <InviteLinkDialog url={inviteUrl} onClose={() => setInviteUrl(null)} />
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger render={<Button disabled={disabled} />}>
          <UserPlusIcon data-icon="inline-start" />
          {t.admins.invite}
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <DialogHeader>
              <DialogTitle>{t.admins.invite}</DialogTitle>
              <DialogDescription>{t.admins.inviteDescription}</DialogDescription>
            </DialogHeader>
            <FieldGroup>
              <Field data-invalid={Boolean(form.formState.errors.email) || undefined}>
                <FieldLabel htmlFor="invite-email">{t.admins.email}</FieldLabel>
                <Input id="invite-email" type="email" autoComplete="off" {...form.register("email")} disabled={pending} />
                <FieldError errors={[form.formState.errors.email]} />
              </Field>
              <Field>
                <FieldLabel htmlFor="invite-name">
                  {t.admins.name}
                  <span className="font-normal text-muted-foreground">（{t.common.optional}）</span>
                </FieldLabel>
                <Input id="invite-name" {...form.register("name")} disabled={pending} />
              </Field>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Field>
                    <FieldLabel>{t.admins.role}</FieldLabel>
                    <Select
                      items={roleItems}
                      value={field.value ?? "admin"}
                      onValueChange={(v) => field.onChange(v)}
                      disabled={pending}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roleItems.map((item) => (
                          <SelectItem key={item.value} value={item.value}>
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                )}
              />
            </FieldGroup>
            <DialogFooter>
              <Button type="submit" disabled={pending}>
                {t.admins.invite}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
