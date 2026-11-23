import { ThemeSwitcher } from "./theme-switcher";
import { PREVIEW_THEMES, previewThemeCss, THEME_STORAGE_KEY } from "./themes";

/**
 * TEMPORARY — palette review for the public site.
 * Renders the theme rules, restores the reviewer's choice before the first paint, and shows the picker.
 * A link can preselect a palette: /de?theme=f-amber  (?theme=default clears it).
 *
 * To remove: delete components/site/theme-preview/ and, in app/(site)/[locale]/layout.tsx,
 * the import, <ThemePreview /> and `suppressHydrationWarning` on <body>.
 * To hide it without removing: NEXT_PUBLIC_THEME_PREVIEW=0.
 */
export function ThemePreview() {
  if (process.env.NEXT_PUBLIC_THEME_PREVIEW === "0") return null;

  const ids = JSON.stringify(PREVIEW_THEMES.map((t) => t.id));
  // Runs while the body is still being parsed, so the page never flashes in the default colours.
  const restore = `(function(){try{var k=${JSON.stringify(THEME_STORAGE_KEY)},ids=${ids},q=new URLSearchParams(location.search).get("theme"),t=q||localStorage.getItem(k);if(q==="default"){localStorage.removeItem(k);return}if(t&&ids.indexOf(t)>-1){document.body.dataset.theme=t;if(q)localStorage.setItem(k,t)}}catch(e){}})()`;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: previewThemeCss() }} />
      <script dangerouslySetInnerHTML={{ __html: restore }} />
      <ThemeSwitcher themes={PREVIEW_THEMES.map((t) => ({ id: t.id, group: t.group, name: t.name, brand: t.brand, deep: t.deep, soft: t.soft }))} />
    </>
  );
}
