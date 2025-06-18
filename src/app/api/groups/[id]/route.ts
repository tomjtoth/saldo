import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { validate } from "uuid";

import { auth, signIn } from "@/auth";
import { joinGroup } from "@/lib/services/groups";
import { currentUser } from "@/lib/services/user";

export async function GET(
  _req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  const [{ id: uuid }, sess] = await Promise.all([params, auth()]);
  if (!sess) return signIn("", { redirectTo: `/api/groups/${uuid}` });

  const user = await currentUser(sess);

  if (validate(uuid)) await joinGroup(uuid, user.id);

  redirect("/groups");
}
