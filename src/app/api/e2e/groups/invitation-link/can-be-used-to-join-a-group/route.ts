import wrapRoute from "@/app/_lib/wrapRoute";
import { svcAddGroup, svcModGroup } from "@/app/groups/_lib";

export const GET = wrapRoute({ requireSession: false }, async () => {
  const group = await svcAddGroup(2, { name: "you and me" });

  await svcModGroup(2, { id: group.id, uuid: "some-uuid" });
});
