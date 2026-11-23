"use client";

import { useSearchParams } from "next/navigation";

/** The search box keeps the term of the current search (?q=…) instead of coming back empty. */
export function SearchInput({ placeholder, className }: { placeholder: string; className: string }) {
  const q = useSearchParams().get("q") ?? "";
  // key: a new search (or leaving the results) resets what the visitor typed.
  return <input key={q} type="search" name="q" defaultValue={q} placeholder={placeholder} className={className} />;
}

/** Renders its children only while no search is active. */
export function HideWhileSearching({ children }: { children: React.ReactNode }) {
  const q = (useSearchParams().get("q") ?? "").trim();
  return q ? null : children;
}
