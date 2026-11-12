import { parseVideoEmbed } from "@/lib/video-embed";

export function VideoEmbed({ kind, url, title }: { kind: "file" | "embed"; url: string; title: string | null }) {
  if (kind === "file") {
    return (
      <figure className="overflow-hidden border border-line bg-ink">
        <video controls preload="metadata" playsInline className="aspect-video w-full" src={url}>
          <track kind="captions" />
        </video>
        {title ? <figcaption className="bg-paper px-4 py-2 text-sm text-ink-2">{title}</figcaption> : null}
      </figure>
    );
  }
  const embed = parseVideoEmbed(url);
  if (!embed) return null;
  return (
    <figure className="overflow-hidden border border-line bg-ink">
      <iframe
        src={embed.embedUrl}
        title={title ?? "Video"}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className="aspect-video w-full"
      />
      {title ? <figcaption className="bg-paper px-4 py-2 text-sm text-ink-2">{title}</figcaption> : null}
    </figure>
  );
}
