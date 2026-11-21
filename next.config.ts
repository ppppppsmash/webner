import type { NextConfig } from "next";

/** Files on S3-compatible storage are read from S3_PUBLIC_URL (or `<endpoint>/<bucket>`); next/image must allow that host. */
function storageImagePattern() {
  const base = process.env.S3_PUBLIC_URL || (process.env.S3_ENDPOINT && process.env.S3_BUCKET ? `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET}` : "");
  if (!base) return [];
  const url = new URL(base);
  return [
    {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      port: url.port,
      pathname: `${url.pathname.replace(/\/+$/, "")}/**`,
    },
  ];
}

const nextConfig: NextConfig = {
  images: { remotePatterns: storageImagePattern() },
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
