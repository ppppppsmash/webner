import { cacheLife } from "next/cache";

/** Current year for copyright lines; cached so the static shell can include it. */
export async function getCurrentYear(): Promise<number> {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}
