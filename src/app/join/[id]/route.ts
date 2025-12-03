import { redirect } from "next/navigation";

import { joinGroup } from "@/app/groups/_lib";
import wrapRoute from "@/app/_lib/wrapRoute";

export const GET = wrapRoute<{ id: string }>(
  { redirectAs: ({ params }) => `/join/${params.id}` },

  async ({ params, user }) => {
    await joinGroup(params.id, user.id);
    redirect("/groups");
  }
);
