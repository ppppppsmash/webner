import type { Metadata } from "next";
import { PageHeader } from "@/components/management/page-header";
import { PageSuspense } from "@/components/management/page-suspense";
import { formatBytes, formatDateTime } from "@/lib/format";
import { t } from "@/lib/i18n/admin";
import { listMedia } from "@/lib/queries/media";
import { MediaGrid, type MediaItem } from "./components/media-grid";
import { MediaUploadButton } from "./components/media-upload-button";

export const metadata: Metadata = { title: t.media.title };

async function MediaContent() {
  const rows = await listMedia();
  const items: MediaItem[] = rows.map((m) => ({
    id: m.id,
    kind: m.kind,
    url: m.url,
    fileName: m.fileName ?? m.key.split("/").pop() ?? m.key,
    contentType: m.contentType,
    size: formatBytes(m.size),
    createdAt: formatDateTime(m.createdAt).split(" ")[0],
    products: m.products,
  }));

  return (
    <>
      <PageHeader title={t.media.count(items.length)} description={t.media.listDescription} action={<MediaUploadButton />} />
      <MediaGrid items={items} />
    </>
  );
}

export default function MediaPage() {
  return (
    <PageSuspense>
      <MediaContent />
    </PageSuspense>
  );
}
