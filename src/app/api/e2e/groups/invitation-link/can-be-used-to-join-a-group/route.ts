import protectedRoute from "@/lib/protectedRoute";
import { createGroup, updateGroup } from "@/lib/services/groups";
import { addUser } from "@/lib/services/users";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const user = await addUser({ name: "user2", email: "user2@e2e.tests" });

    const group = await createGroup(user.id, { name: "you and me" });

    await updateGroup(user.id, group.id!, { uuid: "some-uuid" });
  }
);
