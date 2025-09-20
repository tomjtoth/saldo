import { redirect } from "next/navigation";

import { joinGroup } from "@/lib/services/groups";
import protectedRoute from "@/lib/protectedRoute";

export const GET = protectedRoute<{ id: string }>(
  { redirectAs: (req) => `/join/${req.__params?.id}` },

  async (req) => {
    await joinGroup(req.__params!.id, req.__user.id);
    redirect("/groups");
  }
);
