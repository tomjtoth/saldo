import { auth } from "@/auth";
import { getPareto } from "@/lib/services/pareto";
import { currentUser } from "@/lib/services/user";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ?? undefined;
  const to = searchParams.get("to") ?? undefined;

  const user = await currentUser(sess);
  const data = await getPareto(user.id, { from, to });

  return Response.json(data);
}
