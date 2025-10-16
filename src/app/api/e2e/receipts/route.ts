import { db } from "@/lib/db";
import { revisions } from "@/lib/db/schema";
import protectedRoute from "@/lib/protectedRoute";
import { createCategory } from "@/lib/services/categories";
import { addMember, createGroup } from "@/lib/services/groups";
import { addUser } from "@/lib/services/users";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },

  async () => {
    await db.delete(revisions);

    const user = await addUser({
      name: "user1",
      email: "user1@e2e.tests",
    })!;
    await createGroup(user.id, { name: "just you" });

    const user2 = await addUser({
      name: "user2",
      email: "user2@e2e.tests",
    });
    await addMember(1, user2.id);

    const user3 = await addUser({
      name: "user3",
      email: "user3@e2e.tests",
    });
    await addMember(1, user3.id);

    await createCategory(1, {
      groupId: 1,
      name: "food",
      description: "the vital stuff only",
    });

    await createCategory(1, {
      groupId: 1,
      name: "soft drinks",
      description: null,
    });

    await createCategory(2, {
      groupId: 1,
      name: "gas money",
      description: null,
    });

    await createCategory(3, {
      groupId: 1,
      name: "booze",
      description: "anything with alcohol in it 🥴",
    });
  }
);
