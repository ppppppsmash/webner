"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name, noImageLabel }: { images: GalleryImage[]; name: string; noImageLabel: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];

  if (!current) {
    return <div className="flex aspect-square items-center justify-center bg-paper-2 text-sm text-ink-2">{noImageLabel}</div>;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden border border-line bg-paper">
        <Image key={current.url} src={current.url} alt={current.alt ?? name} fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="rise object-cover" />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none]" aria-label={name}>
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                aria-label={`${name} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={cn("relative block size-20 overflow-hidden border bg-paper-2 transition-colors", i === index ? "border-brand" : "border-line hover:border-brand/50")}
              >
                <Image src={img.url} alt="" fill sizes="80px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
