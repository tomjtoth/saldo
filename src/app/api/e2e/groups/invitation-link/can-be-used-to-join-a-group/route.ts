import wrapRoute from "@/app/_lib/wrapRoute";
import { svcAddUser } from "@/app/(users)/_lib";
import { svcAddGroup, svcUpdateGroup } from "@/app/groups/_lib";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const user = await svcAddUser({ name: "user2", email: "user2@e2e.tests" });

    const group = await svcAddGroup(user.id, { name: "you and me" });

    await svcUpdateGroup(user.id, { id: group.id!, uuid: "some-uuid" });
  }
);
