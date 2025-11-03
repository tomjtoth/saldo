import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";

import CliImportSection from ".";

it("Page renders correctly", () => {
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
