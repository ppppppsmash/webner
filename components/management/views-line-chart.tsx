"use client";

import { useState } from "react";

/** `label` is the sentence shown in the tooltip and read by screen readers (built on the server: functions cannot be passed in). */
export type ChartPoint = { day: string; value: number; label: string };

/** Rounds the top of the scale up to a tidy number (1, 2, 5 × 10ⁿ), never below 4 so a quiet week is not drawn as a mountain. */
function niceMax(max: number): number {
  if (max <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(max));
  const step = [1, 2, 5, 10].find((m) => m * pow >= max) ?? 10;
  return step * pow;
}

const shortDay = (day: string) => day.slice(5).replace("-", "/");

/**
 * Line chart of one number per day. No chart library: the line is a single SVG path stretched to the box
 * (strokes keep their width through `vector-effect`), labels and the hover marker are ordinary HTML on top.
 */
export function ViewsLineChart({ points, title }: { points: ChartPoint[]; title: string }) {
  const [active, setActive] = useState<number | null>(null);
  if (points.length < 2) return null;

  const top = niceMax(Math.max(...points.map((p) => p.value)));
  const x = (i: number) => (i / (points.length - 1)) * 100;
  const y = (value: number) => 100 - (value / top) * 100;
  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(2)},${y(p.value).toFixed(2)}`).join(" ");
  const current = active === null ? null : points[active];

  const pick = (event: React.PointerEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (event.clientX - box.left) / box.width));
    setActive(Math.round(ratio * (points.length - 1)));
  };

  return (
    <figure>
      <figcaption className="sr-only">{title}</figcaption>
      <div className="flex gap-2">
        {/* scale */}
        <div aria-hidden className="flex h-40 flex-col justify-between text-right text-xs text-muted-foreground tabular-nums">
          {[top, top / 2, 0].map((tick) => (
            <span key={tick} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
              {tick}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1">
          <div
            aria-hidden
            className="relative h-40 touch-none"
            onPointerMove={pick}
            onPointerDown={pick}
            onPointerLeave={() => setActive(null)}
          >
            {[0, 50, 100].map((pos) => (
              <span key={pos} className="absolute inset-x-0 border-t border-dashed border-border" style={{ top: `${pos}%` }} />
            ))}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible text-primary">
              <path d={`${line} L100,100 L0,100 Z`} fill="currentColor" opacity="0.08" />
              <path d={line} fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            {current && active !== null ? (
              <>
                <span className="absolute inset-y-0 w-px bg-foreground/25" style={{ left: `${x(active)}%` }} />
                <span
                  className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
                  style={{ left: `${x(active)}%`, top: `${y(current.value)}%` }}
                />
                <span
                  className="pointer-events-none absolute top-1 z-10 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap text-popover-foreground shadow-sm"
                  // Kept inside the box at both ends.
                  style={{ left: `${x(active)}%`, transform: `translateX(${-x(active)}%)` }}
                >
                  {current.label}
                </span>
              </>
            ) : null}
          </div>
          <div aria-hidden className="mt-1 flex justify-between text-xs text-muted-foreground tabular-nums">
            <span>{shortDay(points[0].day)}</span>
            <span>{shortDay(points[Math.floor((points.length - 1) / 2)].day)}</span>
            <span>{shortDay(points[points.length - 1].day)}</span>
          </div>
        </div>
      </div>

      {/* The same numbers as text for screen readers. */}
      <ol className="sr-only">
        {points.map((p) => (
          <li key={p.day}>{p.label}</li>
        ))}
      </ol>
    </figure>
  );
}
