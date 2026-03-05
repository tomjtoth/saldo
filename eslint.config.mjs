import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  {
    rules: {
      "react-hooks/exhaustive-deps": "off",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "**/pwa/index.tsx",
      "coverage",
      "cypress",
      "**/*.test.ts",
    ],
  },

  // TODO: rm this once fixed: https://github.com/vercel/next.js/issues/89764
  {
    settings: {
      react: { version: "19" }, // Avoids auto-detection crash
    },
  },
];

export default eslintConfig;
