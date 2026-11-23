import { notFound } from "next/navigation";

/**
 * Any URL under /{locale} that no other route matches. Without this, Next.js answers with its
 * built-in English 404 (no header, no footer) because the app has no single root layout.
 */
// Nothing links here and the page always throws, so there is no navigation to validate.
export const instant = false;

export default function UnmatchedPage() {
  notFound();
}
