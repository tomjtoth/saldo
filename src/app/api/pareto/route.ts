import protectedRoute from "@/lib/protectedRoute";
import { getPareto } from "@/lib/services/pareto";

export const GET = protectedRoute(async (req) => {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const data = await getPareto(req.__user.id, { from, to });

  return Response.json(data);
});
