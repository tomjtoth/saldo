import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",

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
