import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // In development mode, bypass Next.js server-side image processing & buffer caching
    // to prevent Node.js dev server memory usage from climbing continuously over time.
    unoptimized: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;

