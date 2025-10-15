import protectedRoute from "@/lib/protectedRoute";
import { addMember } from "@/lib/services/groups";
import { addUser } from "@/lib/services/users";

export const GET = protectedRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const otherUser = await addUser({
      name: "e2e2",
      email: "e2e2@tester.saldo",
    });

    await addMember(1, otherUser.id);
  }
);
