import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  output: "standalone",
  turbopack: {
    root: projectRoot
  },
  experimental: {
    cpus: 1
  },
  images: {
    unoptimized: true
  }
};

export default nextConfig;
