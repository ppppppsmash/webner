export type VideoEmbed =
  | { provider: "youtube"; id: string; embedUrl: string; thumbnailUrl: string }
  | { provider: "vimeo"; id: string; embedUrl: string; thumbnailUrl: null }
  | { provider: "other"; embedUrl: string; thumbnailUrl: null };

/**
 * Turns a pasted video page URL into an embeddable URL.
 * Supports YouTube (watch / youtu.be / shorts / embed) and Vimeo; other URLs are used as-is.
 */
export function parseVideoEmbed(input: string): VideoEmbed | null {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    return null;
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return null;
  const host = url.hostname.replace(/^www\./, "").replace(/^m\./, "");

  if (host === "youtu.be") {
    const id = url.pathname.slice(1).split("/")[0];
    return id ? youtube(id) : null;
  }
  if (host === "youtube.com" || host === "youtube-nocookie.com") {
    const fromQuery = url.searchParams.get("v");
    const match = /^\/(?:embed|shorts|live)\/([A-Za-z0-9_-]{6,})/.exec(url.pathname);
    const id = fromQuery ?? match?.[1];
    return id ? youtube(id) : null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const match = /(\d{6,})/.exec(url.pathname);
    if (!match) return null;
    return { provider: "vimeo", id: match[1], embedUrl: `https://player.vimeo.com/video/${match[1]}`, thumbnailUrl: null };
  }
  return { provider: "other", embedUrl: url.toString(), thumbnailUrl: null };
}

function youtube(id: string): VideoEmbed {
  const safe = id.replace(/[^A-Za-z0-9_-]/g, "");
  return {
    provider: "youtube",
    id: safe,
    embedUrl: `https://www.youtube-nocookie.com/embed/${safe}`,
    thumbnailUrl: `https://i.ytimg.com/vi/${safe}/hqdefault.jpg`,
  };
}
