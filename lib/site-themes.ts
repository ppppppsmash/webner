/**
 * Colour themes of the public site. One is chosen in the management panel (設定 → 展示網站配色) and stored in
 * the site settings; app/(site)/[locale]/layout.tsx puts it on <html data-theme> and renders its rules.
 * No drizzle / server imports here: the settings form (client) reads this list too.
 */

/** Fir green. Its values are also the tokens written in the `.site` block of app/globals.css — keep the two in step. */
export const DEFAULT_SITE_THEME = "d-tanne";

export interface SiteTheme {
  id: string;
  group: string;
  name: string;
  /** Buttons, headings, top bar */
  brand: string;
  /** Hero and brand-statement band */
  deep: string;
  /** Footer */
  tint: string;
  /** Navigation strip, shop band */
  soft: string;
  paper2: string;
  /** Warm themes also warm the greys */
  ink?: string;
  ink2?: string;
  line?: string;
  /** The band colour is light: text and buttons on it turn dark */
  lightBand?: boolean;
}

const WARM = { ink: "oklch(0.24 0.012 50)", ink2: "oklch(0.5 0.014 55)", line: "oklch(0.905 0.006 70)" };

/** Palettes given as "hero colour × navigation strip colour": the rest is derived from those two. */
function fromPair(id: string, group: string, name: string, hero: string, nav: string, darkBrand?: string): SiteTheme {
  const anchor = darkBrand ?? hero;
  return {
    id,
    group,
    name,
    // On a dark hero the bar and buttons sit a shade below it; on a light hero they need their own dark colour.
    brand: darkBrand ?? `color-mix(in oklab, ${hero} 82%, black)`,
    deep: hero,
    soft: nav,
    tint: `color-mix(in oklab, ${nav} 78%, ${anchor})`,
    paper2: `color-mix(in oklab, ${nav} 40%, white)`,
    // The given strips are a little darker than the current one: the secondary grey goes a step darker to stay readable on them.
    ink2: "oklch(0.46 0.015 265)",
    lightBand: Boolean(darkBrand),
  };
}

const COOL = "冷色系";
const WARMS = "暖色系";
const PURPLE = "紫色系";
const BOTANICAL = "植萃系";

export const SITE_THEMES: SiteTheme[] = [
  // The default comes first.
  { id: "d-tanne", group: COOL, name: "冷杉綠", brand: "oklch(0.34 0.055 165)", deep: "oklch(0.26 0.045 165)", tint: "oklch(0.87 0.035 160)", soft: "oklch(0.957 0.014 160)", paper2: "oklch(0.972 0.005 160)" },
  { id: "a-marine", group: COOL, name: "海軍藍", brand: "oklch(0.32 0.09 258)", deep: "oklch(0.25 0.075 258)", tint: "oklch(0.85 0.045 238)", soft: "oklch(0.955 0.018 238)", paper2: "oklch(0.972 0.006 240)" },
  { id: "b-royal", group: COOL, name: "皇家藍", brand: "oklch(0.42 0.13 258)", deep: "oklch(0.3 0.1 258)", tint: "oklch(0.87 0.045 245)", soft: "oklch(0.96 0.018 245)", paper2: "oklch(0.972 0.006 245)" },
  { id: "c-petrol", group: COOL, name: "石油藍綠", brand: "oklch(0.36 0.06 215)", deep: "oklch(0.28 0.05 215)", tint: "oklch(0.86 0.04 205)", soft: "oklch(0.957 0.016 205)", paper2: "oklch(0.972 0.005 205)" },
  { id: "e-bordeaux", group: COOL, name: "波爾多紅", brand: "oklch(0.34 0.09 15)", deep: "oklch(0.26 0.07 15)", tint: "oklch(0.89 0.035 25)", soft: "oklch(0.962 0.014 25)", paper2: "oklch(0.975 0.005 40)" },

  { id: "f-amber", group: WARMS, name: "琥珀棕", brand: "oklch(0.38 0.07 55)", deep: "oklch(0.28 0.05 50)", tint: "oklch(0.88 0.04 75)", soft: "oklch(0.96 0.018 80)", paper2: "oklch(0.975 0.006 80)", ...WARM },
  { id: "g-terracotta", group: WARMS, name: "赤陶", brand: "oklch(0.47 0.12 40)", deep: "oklch(0.33 0.085 38)", tint: "oklch(0.89 0.04 55)", soft: "oklch(0.962 0.018 60)", paper2: "oklch(0.976 0.006 60)", ...WARM },
  { id: "h-rosewood", group: WARMS, name: "玫瑰木", brand: "oklch(0.42 0.09 12)", deep: "oklch(0.3 0.07 12)", tint: "oklch(0.9 0.035 20)", soft: "oklch(0.965 0.015 25)", paper2: "oklch(0.977 0.005 30)", ...WARM },
  { id: "i-olive", group: WARMS, name: "橄欖綠", brand: "oklch(0.4 0.065 115)", deep: "oklch(0.29 0.05 115)", tint: "oklch(0.89 0.04 105)", soft: "oklch(0.962 0.018 100)", paper2: "oklch(0.976 0.006 95)", ...WARM },
  { id: "j-ochre", group: WARMS, name: "赭黃", brand: "oklch(0.46 0.095 75)", deep: "oklch(0.32 0.065 70)", tint: "oklch(0.9 0.05 88)", soft: "oklch(0.965 0.022 90)", paper2: "oklch(0.977 0.007 90)", ...WARM },

  fromPair("p1-mist-lavender", PURPLE, "霧薰衣草紫 × 淺霧紫", "#655776", "#E8E0EC"),
  // Light hero: the dark colour for bar, buttons and headings is not in the brief — a deep lavender was picked to match the mock-up.
  fromPair("p2-light-lavender", PURPLE, "淺薰衣草紫 × 鼠尾草灰綠", "#EEE8F2", "#DFE6DA", "#4B3B63"),
  fromPair("p3-rose-grey", PURPLE, "玫瑰灰紫 × 淺粉灰", "#76596E", "#EDDFE5"),
  fromPair("p4-deep-grape", PURPLE, "深葡萄紫 × 淺薰衣草", "#392B47", "#E5DBED"),

  fromPair("n1-eucalyptus", BOTANICAL, "尤加利深綠 × 淺綠灰", "#21443D", "#DDEAE3"),
  // Light hero: dark green picked to match the mock-up (not in the brief).
  fromPair("n2-oat", BOTANICAL, "燕麥米白 × 鼠尾草綠", "#F3EFE5", "#D5DFCF", "#2F4A3D"),
  fromPair("n3-rosemary", BOTANICAL, "迷迭香橄欖綠 × 淺橄欖灰", "#414931", "#E0E4D3"),
  fromPair("n4-amber", BOTANICAL, "深琥珀棕 × 暖砂米", "#54392B", "#EADACA"),
];

export const isSiteThemeId = (value: string): boolean => SITE_THEMES.some((t) => t.id === value);

/**
 * The rules that repaint the public site in one theme, scoped to `[data-theme="…"] .site` so they override
 * the tokens in globals.css. Empty for the default theme: its colours are the ones written in globals.css.
 */
export function siteThemeCss(id: string): string {
  const t = SITE_THEMES.find((theme) => theme.id === id);
  if (!t || t.id === DEFAULT_SITE_THEME) return "";
  const sel = `[data-theme="${t.id}"] .site`;
  const vars = [
    `--brand:${t.brand}`,
    `--brand-deep:${t.deep}`,
    `--tint:${t.tint}`,
    `--tint-soft:${t.soft}`,
    `--paper-2:${t.paper2}`,
    t.ink ? `--ink:${t.ink}` : "",
    t.ink2 ? `--ink-2:${t.ink2}` : "",
    t.line ? `--line:${t.line}` : "",
  ]
    .filter(Boolean)
    .join(";");
  if (!t.lightBand) return `${sel}{${vars}}`;
  const darker = "color-mix(in oklab,var(--brand) 82%,black)";
  return [
    `${sel}{${vars}}`,
    // Light band: what was white on the dark band becomes dark ink, and the buttons swap to the dark set.
    `${sel} .on-dark.bg-brand-deep{--paper:var(--ink);--focus:var(--brand)}`,
    `${sel} .bg-brand-deep .btn-light{background:var(--brand);border-color:var(--brand);color:#fff}`,
    `${sel} .bg-brand-deep .btn-light:hover{background:${darker};border-color:${darker}}`,
    `${sel} .bg-brand-deep .btn-ghost-light{border-color:var(--brand);color:var(--brand)}`,
    `${sel} .bg-brand-deep .btn-ghost-light:hover{background:var(--brand);color:#fff}`,
    `${sel} .btn-primary:hover{background:${darker};border-color:${darker}}`,
  ].join("\n");
}
