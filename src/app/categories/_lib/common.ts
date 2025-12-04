import { QueryParamsOf } from "@/app/_lib/db";
import { SELECT_REVISION_INFO } from "@/app/_lib";

export const SELECT_CATEGORIES = {
  with: { revision: SELECT_REVISION_INFO },
} as const satisfies QueryParamsOf<"categories">;
