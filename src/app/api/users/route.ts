import protectedRoute from "@/lib/protectedRoute";
import { updateUser } from "@/lib/services/users";
import { err } from "@/lib/utils";

export const PUT = protectedRoute(async (req) => {
  const { id, statusId }: { id?: number; statusId?: number } = await req.json();

  if (typeof id !== "number" || typeof statusId !== "number") err();
  if (id !== req.__user.id) err(403);

  return await updateUser(id, { statusId });
});
