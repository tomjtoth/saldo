import wrapRoute from "@/app/_lib/wrapRoute";
import { svcAddUser } from "@/app/(users)/_lib";
import { addMember } from "@/app/groups/_lib";

export const GET = wrapRoute(
  { requireSession: false, onlyDuringDevelopment: true },
  async () => {
    const otherUser = await svcAddUser({
      name: "user2",
      email: "user2@e2e.tests",
    });

    await addMember(1, otherUser.id);
  }
);
