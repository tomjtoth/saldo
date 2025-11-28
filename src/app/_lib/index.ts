import { QueryParamsOf } from "./db";

export const SELECT_REVISION_INFO = {
  columns: { createdAt: true },
  with: { createdBy: { columns: { id: true, name: true, image: true } } },
} as const satisfies QueryParamsOf<"revisions">;
