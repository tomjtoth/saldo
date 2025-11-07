import wrapRoute from "@/app/_lib/wrapRoute";
import { addUser } from "@/app/(users)/_lib";
import { createGroup, svcUpdateGroup } from "@/app/groups/_lib";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const user = await addUser({ name: "user2", email: "user2@e2e.tests" });

    const group = await createGroup(user.id, { name: "you and me" });

    await svcUpdateGroup(user.id, { id: group.id!, uuid: "some-uuid" });
  }
);
