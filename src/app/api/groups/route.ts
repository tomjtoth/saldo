import { v4 as uuid } from "uuid";

import protectedRoute from "@/lib/protectedRoute";
import { TGroup } from "@/lib/db";
import { err, nullEmptyStrings } from "@/lib/utils";
import { updateGroup } from "@/lib/services/groups";

type GroupUpdater = { id: number } & Pick<
  TGroup,
  "name" | "description" | "flags" | "uuid"
> & {
    generateLink?: true;
    removeLink?: true;
  };

export const PUT = protectedRoute(async (req) => {
  const {
    generateLink,
    removeLink,
    id,
    flags,
    name,
    description,
  }: GroupUpdater = await req.json();

  if (
    typeof id !== "number" ||
    !["number", "undefined"].includes(typeof flags) ||
    !["string", "undefined"].includes(typeof name) ||
    (description !== null &&
      !["string", "undefined"].includes(typeof description))
  )
    err();

  const data = {
    flags,
    name,
    description,
    uuid: generateLink ? uuid() : removeLink ? null : undefined,
  };

  nullEmptyStrings(data);

  const group = await updateGroup(req.__user.id, id, data);

  if (!group) err(404);

  return group;
});
