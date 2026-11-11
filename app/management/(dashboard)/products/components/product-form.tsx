"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteProduct, saveProduct } from "@/actions/products";
import { AlertModal } from "@/components/management/alert-modal";
import { ImagesField } from "@/components/management/images-field";
import { LocalizedField } from "@/components/management/localized-field";
import { PageHeader } from "@/components/management/page-header";
import { RichTextEditor } from "@/components/management/rich-text-editor";
import { VideosField } from "@/components/management/videos-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/db/schema";
import { t } from "@/lib/i18n/admin";
import { emptyLocalizedText, pickText } from "@/lib/i18n/locales";
import type { ProductWithMedia } from "@/lib/queries/products";
import { productFormSchema, type ProductFormInput } from "@/lib/validation/product";

const NONE = "__none__";

interface ProductFormProps {
  initialData: ProductWithMedia | null;
  categories: Array<Category & { depth: number }>;
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initialData);

  const categoryItems = [
    { value: NONE, label: t.products.noCategory },
    ...categories.map((c) => ({
      value: c.id,
      label: `${c.depth ? "— " : ""}${pickText(c.name, "zh-TW")}`,
    })),
  ];

  const form = useForm<ProductFormInput>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      id: initialData?.id,
      name: { ...emptyLocalizedText(), ...(initialData?.name ?? {}) },
      summary: { ...emptyLocalizedText(), ...(initialData?.summary ?? {}) },
      description: { ...emptyLocalizedText(), ...(initialData?.description ?? {}) },
      slug: initialData?.slug ?? "",
      categoryId: initialData?.categoryId ?? null,
      volume: initialData?.volume ?? "",
      externalUrl: initialData?.externalUrl ?? "",
      isPublished: initialData?.isPublished ?? false,
      isFeatured: initialData?.isFeatured ?? false,
      sortOrder: initialData?.sortOrder ?? 0,
      images: initialData?.images.map((i) => ({ url: i.url, alt: i.alt ?? "" })) ?? [],
      videos: initialData?.videos.map((v) => ({ kind: v.kind, url: v.url, title: v.title ?? "" })) ?? [],
    },
  });

  const onSubmit = (values: ProductFormInput) => {
    startTransition(async () => {
      const result = await saveProduct(values);
      if (!result.ok) {
        if (result.field) {
          form.setError(result.field as keyof ProductFormInput, { message: result.error });
        }
        toast.error(result.error);
        return;
      }
      toast.success(isEdit ? t.products.updated : t.products.created);
      if (isEdit) {
        router.refresh();
      } else {
        router.push(`/management/products/${result.data.id}`);
      }
    });
  };

  const onDelete = () => {
    if (!initialData) return;
    startTransition(async () => {
      const result = await deleteProduct(initialData.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success(t.products.deleted);
      router.push("/management/products");
      router.refresh();
    });
  };

  const errors = form.formState.errors;
  const nameValue = form.watch("name") ?? emptyLocalizedText();
  const summaryValue = form.watch("summary") ?? emptyLocalizedText();
  const descriptionValue = form.watch("description") ?? emptyLocalizedText();

  return (
    <>
      <AlertModal open={open} onOpenChange={setOpen} onConfirm={onDelete} loading={pending} />
      <PageHeader
        title={isEdit ? t.products.editTitle : t.products.createTitle}
        description={isEdit ? t.products.editDescription : t.products.createDescription}
        action={
          isEdit ? (
            <Button variant="destructive" size="icon" disabled={pending} onClick={() => setOpen(true)} aria-label={t.common.delete}>
              <TrashIcon />
            </Button>
          ) : null
        }
      />

      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-6">
              <Field data-invalid={Boolean(errors.name) || undefined}>
                <FieldLabel>{t.products.name}</FieldLabel>
                <LocalizedField value={nameValue}>
                  {(locale) => (
                    <Input
                      {...form.register(`name.${locale}`)}
                      disabled={pending}
                      placeholder={t.products.namePlaceholder}
                      aria-invalid={Boolean(errors.name) || undefined}
                    />
                  )}
                </LocalizedField>
                <FieldError errors={[errors.name as { message?: string } | undefined]} />
              </Field>

              <Field>
                <FieldLabel>
                  {t.products.summary}
                  <span className="font-normal text-muted-foreground">（{t.common.optional}）</span>
                </FieldLabel>
                <LocalizedField value={summaryValue}>
                  {(locale) => (
                    <Input {...form.register(`summary.${locale}`)} disabled={pending} placeholder={t.products.summaryPlaceholder} />
                  )}
                </LocalizedField>
              </Field>

              <Field>
                <FieldLabel>{t.products.description}</FieldLabel>
                <LocalizedField value={descriptionValue}>
                  {(locale) => (
                    <Controller
                      control={form.control}
                      name={`description.${locale}`}
                      render={({ field }) => (
                        <RichTextEditor
                          value={field.value ?? ""}
                          onChange={field.onChange}
                          disabled={pending}
                          placeholder={t.editor.placeholder}
                        />
                      )}
                    />
                  )}
                </LocalizedField>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.images}</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="images"
                render={({ field }) => (
                  <Field>
                    <ImagesField value={field.value ?? []} onChange={field.onChange} disabled={pending} />
                    <FieldDescription>{t.products.imagesHint}</FieldDescription>
                  </Field>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.products.videos}</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="videos"
                render={({ field }) => (
                  <Field>
                    <VideosField value={field.value ?? []} onChange={field.onChange} disabled={pending} />
                    <FieldDescription>{t.products.videosHint}</FieldDescription>
                  </Field>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Side column */}
        <div className="space-y-6">
          <Card>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{t.products.isPublished}</FieldTitle>
                        <FieldDescription>{t.products.isPublishedHint}</FieldDescription>
                      </FieldContent>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} disabled={pending} />
                    </Field>
                  )}
                />
                <Controller
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <Field orientation="horizontal">
                      <FieldContent>
                        <FieldTitle>{t.products.isFeatured}</FieldTitle>
                        <FieldDescription>{t.products.isFeaturedHint}</FieldDescription>
                      </FieldContent>
                      <Switch checked={field.value ?? false} onCheckedChange={field.onChange} disabled={pending} />
                    </Field>
                  )}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <FieldGroup>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid || undefined}>
                      <FieldLabel>{t.products.category}</FieldLabel>
                      <Select
                        items={categoryItems}
                        value={field.value ?? NONE}
                        onValueChange={(v) => field.onChange(v === NONE || v == null ? null : String(v))}
                        disabled={pending}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder={t.products.selectCategory} />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryItems.map((item) => (
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

                <Field data-invalid={Boolean(errors.volume) || undefined}>
                  <FieldLabel htmlFor="volume">{t.products.volume}</FieldLabel>
                  <Input id="volume" {...form.register("volume")} disabled={pending} placeholder={t.products.volumePlaceholder} />
                  <FieldError errors={[errors.volume]} />
                </Field>

                <Field data-invalid={Boolean(errors.externalUrl) || undefined}>
                  <FieldLabel htmlFor="externalUrl">{t.products.externalUrl}</FieldLabel>
                  <Input
                    id="externalUrl"
                    type="url"
                    {...form.register("externalUrl")}
                    disabled={pending}
                    placeholder="https://www.japanaceshop.com/products/…"
                  />
                  <FieldDescription>{t.products.externalUrlHint}</FieldDescription>
                  <FieldError errors={[errors.externalUrl]} />
                </Field>

                <Field data-invalid={Boolean(errors.sortOrder) || undefined}>
                  <FieldLabel htmlFor="sortOrder">{t.common.sortOrder}</FieldLabel>
                  <Input id="sortOrder" type="number" min={0} {...form.register("sortOrder", { valueAsNumber: true })} disabled={pending} />
                  <FieldDescription>{t.common.sortOrderHint}</FieldDescription>
                  <FieldError errors={[errors.sortOrder]} />
                </Field>

                <Field data-invalid={Boolean(errors.slug) || undefined}>
                  <FieldLabel htmlFor="slug">{t.common.slug}</FieldLabel>
                  <Input id="slug" {...form.register("slug")} disabled={pending} placeholder="white-rose-serum" />
                  <FieldDescription>{t.common.slugHint}</FieldDescription>
                  <FieldError errors={[errors.slug]} />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={pending}>
              {isEdit ? t.common.saveChanges : t.common.create}
            </Button>
            <Button type="button" variant="ghost" disabled={pending} onClick={() => router.push("/management/products")}>
              {t.common.cancel}
            </Button>
          </div>
        </div>
      </form>
    </>
  );
}
