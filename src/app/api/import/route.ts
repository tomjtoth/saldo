import protectedRoute from "@/lib/protectedRoute";
import { alreadyInProd, importV3 } from "@/lib/services/importV3";
import { err } from "@/lib/utils";

export const POST = protectedRoute(async () => {
  if (await alreadyInProd()) err(403, "already in production");

  const imported = await importV3();

  return Response.json(imported);
});
