import { redirect } from "next/navigation";

import { joinGroup } from "@/lib/services/groups";
import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute<{ id: string }>(
  { redirectAs: ({ params }) => `/join/${params.id}` },

  async ({ params, user }) => {
    await joinGroup(params.id, user.id);
    redirect("/groups");
  }
);
