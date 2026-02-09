import { sql } from "drizzle-orm";

import { QueryParamsOf } from "@/app/_lib/db";

export const USERS_SELECT = {
  with: { categoriesHiddenFromConsumption: { columns: { id: true } } },
  extras: {
    color: (users) => sql<string>`printf(
      '#%06x',
      coalesce(
        (
          SELECT color FROM chart_colors
          WHERE user_id = ${users.id}
          AND group_id IS NULL
          AND member_id IS NULL
        ),
        abs(random()) % 0x1000000
      )
    )`,
  },
} as const satisfies QueryParamsOf<"users">;
