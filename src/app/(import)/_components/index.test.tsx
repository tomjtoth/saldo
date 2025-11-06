import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";

/**
 *  FAIL  src/app/(import)/_components/index.test.tsx [ src/app/(import)/_components/index.test.tsx ]
 *  Error: Cannot find module '/home/ttj/Projects/IT/saldo/node_modules/next/server' imported from /home/ttj/Projects/IT/saldo/node_modules/next-auth/lib/env.js
 *  Did you mean to import "next/server.js"?
 */
it.skip("Page renders correctly", async () => {
  const { default: CliImportSection } = await import(".");

  render(
    <CliImportSection
      {...{
        revisions: 0,
        users: 0,
        groups: 0,
        memberships: 0,
        categories: 0,
        receipts: 0,
        items: 0,
        itemShares: 0,
      }}
    />
  );

  const btn = screen.getByText("re-import V3");

  expect(btn).toBeDefined();
});
