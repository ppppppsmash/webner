"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteCategory, saveCategory } from "@/actions/categories";
import { AlertModal } from "@/components/management/alert-modal";
import { LocalizedField } from "@/components/management/localized-field";
import { PageHeader } from "@/components/management/page-header";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Category } from "@/db/schema";
import { t } from "@/lib/i18n/admin";
import { emptyLocalizedText, pickText } from "@/lib/i18n/locales";
import { categoryFormSchema, type CategoryFormInput } from "@/lib/validation/category";

const NONE = "__none__";

interface CategoryFormProps {
  initialData: Category | null;
  parents: Category[];
}

export function CategoryForm({ initialData, parents }: CategoryFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const isEdit = Boolean(initialData);
  const parentOptions = parents.filter((p) => p.id !== initialData?.id);
  const parentItems = [
    { value: NONE, label: t.categories.noParent },
    ...parentOptions.map((p) => ({ value: p.id, label: pickText(p.name, "zh-TW") })),
  ];

  const form = useForm<CategoryFormInput>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      id: initialData?.id,
      name: { ...emptyLocalizedText(), ...(initialData?.name ?? {}) },
      slug: initialData?.slug ?? "",
      parentId: initialData?.parentId ?? null,
      sortOrder: initialData?.sortOrder ?? 0,
    },
  });

  const onSubmit = (values: CategoryFormInput) => {
    startTransition(async () => {
      const result = await saveCategory(values);
      if (!result.ok) {
        if (result.field) {
          form.setError(result.field as keyof CategoryFormInput, { message: result.error });
        }
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? t.categories.updated : t.categories.created);
      router.push("/management/categories");
      router.refresh();
    });
  };

  const onDelete = () => {
    if (!initialData) return;
    startTransition(async () => {
      const result = await deleteCategory(initialData.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.categories.deleted);
      router.push("/management/categories");
      router.refresh();
    });
  };

  const nameValue = form.watch("name") ?? emptyLocalizedText();

  return (
    <>
      <AlertModal open={open} onOpenChange={setOpen} onConfirm={onDelete} loading={pending} />
      <PageHeader
        title={isEdit ? t.categories.editTitle : t.categories.createTitle}
        action={
          isEdit ? (
            <Button variant="destructive" size="icon" disabled={pending} onClick={() => setOpen(true)} aria-label={t.common.delete}>
              <TrashIcon />
            </Button>
          ) : null
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="max-w-3xl space-y-8">
        <FieldGroup>
          <Field data-invalid={Boolean(form.formState.errors.name) || undefined}>
            <FieldLabel>{t.categories.name}</FieldLabel>
            <LocalizedField value={nameValue}>
              {(locale) => (
                <Input
                  {...form.register(`name.${locale}`)}
                  disabled={pending}
                  placeholder={t.categories.name}
                  aria-invalid={Boolean(form.formState.errors.name) || undefined}
                />
              )}
            </LocalizedField>
            <FieldError errors={[form.formState.errors.name as { message?: string } | undefined]} />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Controller
              control={form.control}
              name="parentId"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid || undefined}>
                  <FieldLabel>{t.categories.parent}</FieldLabel>
                  <Select
                    items={parentItems}
                    value={field.value ?? NONE}
                    onValueChange={(v) => field.onChange(v === NONE || v == null ? null : String(v))}
                    disabled={pending}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={t.categories.selectParent} />
                    </SelectTrigger>
                    <SelectContent>
                      {parentItems.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Field data-invalid={Boolean(form.formState.errors.sortOrder) || undefined}>
              <FieldLabel htmlFor="sortOrder">{t.common.sortOrder}</FieldLabel>
              <Input
                id="sortOrder"
                type="number"
                min={0}
                {...form.register("sortOrder", { valueAsNumber: true })}
                disabled={pending}
              />
              <FieldDescription>{t.common.sortOrderHint}</FieldDescription>
              <FieldError errors={[form.formState.errors.sortOrder]} />
            </Field>
          </div>

          <Controller
            control={form.control}
            name="slug"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid || undefined}>
                <FieldLabel htmlFor="slug">{t.common.slug}</FieldLabel>
                <Input id="slug" {...field} value={field.value ?? ""} disabled={pending} placeholder="face-care" />
                <FieldDescription>{t.common.slugHint}</FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex items-center gap-2">
          <Button type="submit" disabled={pending}>
            {isEdit ? t.common.saveChanges : t.common.create}
          </Button>
          <Button type="button" variant="ghost" disabled={pending} onClick={() => router.push("/management/categories")}>
            {t.common.cancel}
          </Button>
        </div>
      </form>
    </>
  );
}
