import protectedRoute from "@/lib/protectedRoute";
import { addMember } from "@/lib/services/groups";
import { addUser } from "@/lib/services/users";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const otherUser = await addUser({
      name: "user2",
      email: "user2@e2e.tests",
    });

    await addMember(1, otherUser.id);
  }
);
