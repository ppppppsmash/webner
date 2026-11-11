"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALES, type Locale, type LocalizedText } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";

interface LocalizedFieldProps {
  value: LocalizedText;
  /** Renders the input for one locale */
  children: (locale: Locale, value: string) => React.ReactNode;
  className?: string;
}

/**
 * Tab strip (de / en / zh-TW / zh-CN) around any per-locale input.
 * A dot on the tab shows that the locale already has content.
 */
export function LocalizedField({ value, children, className }: LocalizedFieldProps) {
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);

  return (
    <Tabs value={locale} onValueChange={(v) => setLocale(v as Locale)} className={cn("gap-2", className)}>
      <TabsList variant="line" className="h-8">
        {LOCALES.map((l) => {
          const filled = (value[l] ?? "").replace(/<[^>]*>/g, "").trim().length > 0;
          return (
            <TabsTrigger key={l} value={l} className="gap-1.5 px-2">
              <span>{LOCALE_LABELS[l]}</span>
              <span
                aria-hidden
                className={cn("size-1.5 rounded-full", filled ? "bg-emerald-500" : "bg-muted-foreground/30")}
              />
            </TabsTrigger>
          );
        })}
      </TabsList>
      {LOCALES.map((l) => (
        <TabsContent key={l} value={l}>
          {children(l, value[l] ?? "")}
        </TabsContent>
      ))}
    </Tabs>
  );
}
