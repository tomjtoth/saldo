import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: "jsdom",
    coverage: {
      provider: "v8",
      exclude: [
        ".next",
        "cypress",
        "src/app",

        "cypress.config.ts",
        "eslint.config.mjs",
        "next-env.d.ts",
        "next.config.ts",
        "postcss.config.mjs",
        "vitest.config.ts",
      ],
    },
  },
});
