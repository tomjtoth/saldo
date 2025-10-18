import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    return config;
  },
  experimental: process.env.INSTRUMENT_E2E
    ? {
        swcPlugins: [
          // required for e2e lcov retrieval
          ["swc-plugin-coverage-instrument", {}],
        ],
      }
    : undefined,
};

export default nextConfig;
