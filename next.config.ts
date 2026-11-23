import type { NextConfig } from "next";

/**
 * Files on S3-compatible storage are read from S3_PUBLIC_URL (or `<endpoint>/<bucket>`); next/image must allow that host.
 * S3_LEGACY_PUBLIC_URL (optional, comma-separated) keeps the previous location allowed while files are being moved
 * to a new storage (pnpm media:migrate), so pages that still point at the old URLs keep working. Remove it afterwards.
 */
function storageImagePatterns() {
  const endpoint = process.env.S3_ENDPOINT || process.env.AWS_ENDPOINT_URL_S3;
  const current = process.env.S3_PUBLIC_URL || (endpoint && process.env.S3_BUCKET ? `${endpoint}/${process.env.S3_BUCKET}` : "");
  const legacy = (process.env.S3_LEGACY_PUBLIC_URL ?? "").split(",").map((u) => u.trim());
  return [current, ...legacy].filter(Boolean).map((base) => {
    const url = new URL(base);
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `${url.pathname.replace(/\/+$/, "")}/**`,
    };
  });
}

const nextConfig: NextConfig = {
  images: { remotePatterns: storageImagePatterns() },
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
