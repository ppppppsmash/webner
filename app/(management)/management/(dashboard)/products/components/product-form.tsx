"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TrashIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, type Control, type FieldErrors, useForm } from "react-hook-form";
import { toast } from "sonner";
import { deleteProduct, saveProduct } from "@/actions/products";
import { AlertModal } from "@/components/management/alert-modal";
import { ImagesField } from "@/components/management/images-field";
import { LocalizedField } from "@/components/management/localized-field";
import { PageHeader } from "@/components/management/page-header";
import { RichTextEditor } from "@/components/management/rich-text-editor";
import { VideosField } from "@/components/management/videos-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Category } from "@/db/schema";
import { PRODUCT_BADGES, type ProductBadge } from "@/lib/product-badges";
import { t } from "@/lib/i18n/admin";
import { DEFAULT_LOCALE, emptyLocalizedText, type Locale, pickText } from "@/lib/i18n/locales";
import { localePath } from "@/lib/i18n/paths";
import type { ProductWithMedia } from "@/lib/queries/products";
import { cn } from "@/lib/utils";
import { PRODUCT_LIMITS, productFormSchema, type ProductFormInput } from "@/lib/validation/product";

const NONE = "__none__";

type TabKey = "basic" | "media" | "category" | "seo" | "settings";

/** Which form fields live on which tab (used to flag tabs with validation errors). */
const TAB_FIELDS: Record<TabKey, Array<keyof ProductFormInput>> = {
  basic: ["name", "summary", "description"],
  media: ["images", "videos"],
  category: ["categoryId", "volume"],
  seo: ["slug", "seoTitle", "seoDescription"],
  settings: ["externalUrl", "sortOrder", "isFeatured", "isPublished", "badge"],
};

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: "basic", label: t.products.tabBasic },
  { key: "media", label: t.products.tabMedia },
  { key: "category", label: t.products.tabCategory },
  { key: "seo", label: t.products.tabSeo },
  { key: "settings", label: t.products.tabSettings },
];

function firstTabWithError(errors: FieldErrors<ProductFormInput>): TabKey | null {
  for (const tab of TABS) {
    if (TAB_FIELDS[tab.key].some((f) => errors[f])) return tab.key;
  }
  return null;
}

interface ProductFormProps {
  initialData: ProductWithMedia | null;
  categories: Array<Category & { depth: number }>;
}

/** SHOPLINE-style save bar: hint, publish switch, cancel and save. Rendered above (sticky) and below the form. */
function SaveBar({
  control,
  pending,
  isEdit,
  sticky,
  onCancel,
}: {
  control: Control<ProductFormInput>;
  pending: boolean;
  isEdit: boolean;
  sticky?: boolean;
  onCancel: () => void;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border bg-card px-4 py-3 text-sm",
        sticky && "sticky top-[calc(var(--header-height)+0.5rem)] z-20 bg-card/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-card/80",
      )}
    >
      <p className="hidden text-muted-foreground md:block">{t.products.saveBarHint}</p>
      <div className="ml-auto flex items-center gap-3">
        <Controller
          control={control}
          name="isPublished"
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <span className="font-medium">{t.products.isPublished}</span>
              <Switch
                checked={field.value ?? false}
                onCheckedChange={field.onChange}
                disabled={pending}
                aria-label={t.products.isPublished}
              />
            </div>
          )}
        />
        <Button type="button" variant="ghost" disabled={pending} onClick={onCancel}>
          {t.common.cancel}
        </Button>
        <Button type="submit" disabled={pending}>
          {isEdit ? t.common.saveChanges : t.common.create}
        </Button>
      </div>
    </div>
  );
}

export function ProductForm({ initialData, categories }: ProductFormProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<TabKey>("basic");
  const [seoLocale, setSeoLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(initialData);

  const badgeItems = [
    { value: NONE, label: t.products.badgeNone },
    ...PRODUCT_BADGES.map((b) => ({ value: b, label: t.products.badges[b] })),
  ];

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
      seoTitle: { ...emptyLocalizedText(), ...(initialData?.seoTitle ?? {}) },
      seoDescription: { ...emptyLocalizedText(), ...(initialData?.seoDescription ?? {}) },
      description: { ...emptyLocalizedText(), ...(initialData?.description ?? {}) },
      slug: initialData?.slug ?? "",
      categoryId: initialData?.categoryId ?? null,
      volume: initialData?.volume ?? "",
      externalUrl: initialData?.externalUrl ?? "",
      isPublished: initialData?.isPublished ?? false,
      isFeatured: initialData?.isFeatured ?? false,
      badge: initialData?.badge ?? null,
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
          const field = result.field.split(".")[0] as keyof ProductFormInput;
          form.setError(field, { message: result.error });
          const target = firstTabWithError({ [field]: { message: result.error } } as FieldErrors<ProductFormInput>);
          if (target) setTab(target);
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

  const onInvalid = (errs: FieldErrors<ProductFormInput>) => {
    const target = firstTabWithError(errs);
    if (target) setTab(target);
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

  const onCancel = () => router.push("/management/products");

  const errors = form.formState.errors;
  const nameValue = form.watch("name") ?? emptyLocalizedText();
  const summaryValue = form.watch("summary") ?? emptyLocalizedText();
  const descriptionValue = form.watch("description") ?? emptyLocalizedText();
  const seoTitleValue = form.watch("seoTitle") ?? emptyLocalizedText();
  const seoDescriptionValue = form.watch("seoDescription") ?? emptyLocalizedText();
  const slugValue = form.watch("slug") ?? "";
  const previewTitle = seoTitleValue[seoLocale] || nameValue[seoLocale] || pickText(nameValue, seoLocale);
  const previewDescription =
    seoDescriptionValue[seoLocale] || summaryValue[seoLocale] || pickText(summaryValue, seoLocale);

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

      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        <SaveBar control={form.control} pending={pending} isEdit={isEdit} sticky onCancel={onCancel} />

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList variant="line" className="h-9 w-full justify-start gap-1 overflow-x-auto border-b">
            {TABS.map((item) => {
              const hasError = TAB_FIELDS[item.key].some((f) => errors[f]);
              return (
                <TabsTrigger key={item.key} value={item.key} className="flex-none gap-1.5 px-3">
                  {item.label}
                  {hasError ? (
                    <span className="size-1.5 rounded-full bg-destructive" role="img" aria-label={t.products.tabHasError} />
                  ) : null}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* 基本資訊 */}
          <TabsContent value="basic" keepMounted>
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

                <Field data-invalid={Boolean(errors.summary) || undefined}>
                  <FieldLabel>
                    {t.products.summary}
                    <span className="font-normal text-muted-foreground">（{t.common.optional}）</span>
                  </FieldLabel>
                  <LocalizedField value={summaryValue} max={PRODUCT_LIMITS.summary}>
                    {(locale) => (
                      <Textarea
                        {...form.register(`summary.${locale}`)}
                        rows={3}
                        disabled={pending}
                        placeholder={t.products.summaryPlaceholder}
                        aria-invalid={Boolean(errors.summary) || undefined}
                      />
                    )}
                  </LocalizedField>
                  <FieldDescription>{t.products.summaryHint}</FieldDescription>
                  <FieldError errors={[errors.summary as { message?: string } | undefined]} />
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
          </TabsContent>

          {/* 圖片與影片 */}
          <TabsContent value="media" keepMounted>
            <div className="space-y-4">
              <Card>
                <CardContent>
                  <Controller
                    control={form.control}
                    name="images"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t.products.images}</FieldLabel>
                        <ImagesField value={field.value ?? []} onChange={field.onChange} disabled={pending} />
                        <FieldDescription>{t.products.imagesHint}</FieldDescription>
                      </Field>
                    )}
                  />
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Controller
                    control={form.control}
                    name="videos"
                    render={({ field }) => (
                      <Field>
                        <FieldLabel>{t.products.videos}</FieldLabel>
                        <VideosField value={field.value ?? []} onChange={field.onChange} disabled={pending} />
                        <FieldDescription>{t.products.videosHint}</FieldDescription>
                      </Field>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 分類與規格 */}
          <TabsContent value="category" keepMounted>
            <Card>
              <CardContent>
                <FieldGroup className="max-w-xl">
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
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 網址與 SEO */}
          <TabsContent value="seo" keepMounted>
            <Card>
              <CardContent>
                <FieldGroup className="max-w-xl">
                  <Field data-invalid={Boolean(errors.slug) || undefined}>
                    <FieldLabel htmlFor="slug">{t.common.slug}</FieldLabel>
                    <Input id="slug" {...form.register("slug")} disabled={pending} placeholder="white-rose-serum" />
                    <FieldDescription>{t.common.slugHint}</FieldDescription>
                    <FieldError errors={[errors.slug]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.seoTitle) || undefined}>
                    <FieldLabel>
                      {t.products.seoTitle}
                      <span className="font-normal text-muted-foreground">（{t.common.optional}）</span>
                    </FieldLabel>
                    <LocalizedField
                      value={seoTitleValue}
                      max={PRODUCT_LIMITS.seoTitle}
                      locale={seoLocale}
                      onLocaleChange={setSeoLocale}
                    >
                      {(locale) => (
                        <Input {...form.register(`seoTitle.${locale}`)} disabled={pending} placeholder={nameValue[locale] || ""} />
                      )}
                    </LocalizedField>
                    <FieldDescription>{t.products.seoTitleHint}</FieldDescription>
                    <FieldError errors={[errors.seoTitle as { message?: string } | undefined]} />
                  </Field>

                  <Field data-invalid={Boolean(errors.seoDescription) || undefined}>
                    <FieldLabel>
                      {t.products.seoDescription}
                      <span className="font-normal text-muted-foreground">（{t.common.optional}）</span>
                    </FieldLabel>
                    <LocalizedField
                      value={seoDescriptionValue}
                      max={PRODUCT_LIMITS.seoDescription}
                      locale={seoLocale}
                      onLocaleChange={setSeoLocale}
                    >
                      {(locale) => (
                        <Textarea
                          {...form.register(`seoDescription.${locale}`)}
                          rows={3}
                          disabled={pending}
                          placeholder={summaryValue[locale] || ""}
                        />
                      )}
                    </LocalizedField>
                    <FieldDescription>{t.products.seoDescriptionHint}</FieldDescription>
                    <FieldError errors={[errors.seoDescription as { message?: string } | undefined]} />
                  </Field>

                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="mb-2 text-xs font-medium text-muted-foreground">{t.products.seoPreview}</p>
                    {previewTitle ? (
                      <div className="space-y-0.5">
                        <p className="truncate text-xs text-muted-foreground">
                          {localePath(seoLocale, `/products/${slugValue || "…"}`)}
                        </p>
                        <p className="truncate text-base font-medium text-blue-700 dark:text-blue-400">{previewTitle}</p>
                        <p className="line-clamp-2 text-sm text-muted-foreground">{previewDescription}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">{t.products.seoPreviewEmpty}</p>
                    )}
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 設定 */}
          <TabsContent value="settings" keepMounted>
            <Card>
              <CardContent>
                <FieldGroup className="max-w-xl">
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

                  <Controller
                    control={form.control}
                    name="badge"
                    render={({ field, fieldState }) => (
                      <Field data-invalid={fieldState.invalid || undefined}>
                        <FieldLabel>{t.products.badge}</FieldLabel>
                        <Select
                          items={badgeItems}
                          value={field.value ?? NONE}
                          onValueChange={(v) => field.onChange(v === NONE || v == null ? null : (String(v) as ProductBadge))}
                          disabled={pending}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {badgeItems.map((item) => (
                              <SelectItem key={item.value} value={item.value}>
                                {item.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FieldDescription>{t.products.badgeHint}</FieldDescription>
                        <FieldError errors={[fieldState.error]} />
                      </Field>
                    )}
                  />

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
                </FieldGroup>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SaveBar control={form.control} pending={pending} isEdit={isEdit} onCancel={onCancel} />
      </form>
    </>
  );
}
