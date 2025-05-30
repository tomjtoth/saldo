import { render, screen } from "@testing-library/react";
import { it, expect } from "vitest";

import Button from ".";

it("MyComponent renders correctly", () => {
  render(<Button />);
  const btn = screen.getByText("re-import V3");
  expect(btn).toBeDefined();
});
