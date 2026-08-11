import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  serverExternalPackages: ['pg', 'pg-boss', '@electric-sql/pglite', 'better-sqlite3'],
};

export default nextConfig;
