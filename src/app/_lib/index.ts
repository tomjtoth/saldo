import { QueryParamsOf } from "./db";

export const SELECT_REVISION_INFO = {
  columns: { createdAt: true, createdById: true },
} as const satisfies QueryParamsOf<"revisions">;
