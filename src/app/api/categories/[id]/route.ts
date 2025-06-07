import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { TCategoryUpdater, updateCategory } from "@/lib/services/categories";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [data, sess] = await Promise.all([
    req.json() as TCategoryUpdater,
    auth(),
  ]);

  if (!sess) return new Response(null, { status: 401 });
  if (!data.description && !data.statusId)
    return new Response(null, { status: 400 });

  const [{ id }, user] = await Promise.all([params, currentUser(sess)]);

  try {
    const updated = await updateCategory(Number(id), user.id, data);
    if (!updated) return new Response(null, { status: 404 });

    return Response.json(updated!.get({ plain: true }));
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 400 });
  }
}
