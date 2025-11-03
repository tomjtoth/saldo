import wrapRoute from "@/app/_lib/wrapRoute";
import { addUser, createGroup, updateGroup } from "@/app/_lib/services";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const user = await addUser({ name: "user2", email: "user2@e2e.tests" });

    const group = await createGroup(user.id, { name: "you and me" });

    await updateGroup(user.id, { id: group.id!, uuid: "some-uuid" });
  }
);
