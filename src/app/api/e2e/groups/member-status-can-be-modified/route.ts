import wrapRoute from "@/app/_lib/wrapRoute";
import { addMember } from "@/app/_lib/services/groups";
import { addUser } from "@/app/_lib/services/users";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const otherUser = await addUser({
      name: "user2",
      email: "user2@e2e.tests",
    });

    await addMember(1, otherUser.id);
  }
);
