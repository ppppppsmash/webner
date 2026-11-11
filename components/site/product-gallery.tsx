"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export type GalleryImage = { url: string; alt: string | null };

export function ProductGallery({ images, name, noImageLabel }: { images: GalleryImage[]; name: string; noImageLabel: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-3xl bg-paper-2 text-sm text-ink-2">{noImageLabel}</div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row-reverse">
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-3xl bg-paper-2">
        <Image
          key={current.url}
          src={current.url}
          alt={current.alt ?? name}
          fill
          priority
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="rise object-cover"
        />
      </div>
      {images.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto [scrollbar-width:none] md:w-20 md:flex-col md:overflow-visible" aria-label={name}>
          {images.map((img, i) => (
            <li key={img.url} className="shrink-0">
              <button
                type="button"
                aria-label={`${name} ${i + 1}`}
                aria-current={i === index ? "true" : undefined}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative block size-20 overflow-hidden rounded-xl border-2 bg-paper-2 transition-colors",
                  i === index ? "border-moss" : "border-transparent hover:border-line",
                )}
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
