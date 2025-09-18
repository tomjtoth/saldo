import protectedRoute from "@/lib/protectedRoute";
import { updateUser } from "@/lib/services/users";
import { err } from "@/lib/utils";

export const PUT = protectedRoute(async (req) => {
  const { id, flags }: { id?: number; flags?: number } = await req.json();

  if (typeof id !== "number" || typeof flags !== "number") err();
  if (id !== req.__user.id) err(403);

  return await updateUser(id, { flags });
});
