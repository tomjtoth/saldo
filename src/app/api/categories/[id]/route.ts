import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import {
  getCatsIdsFor,
  TCategoryUpdater,
  updateCategory,
} from "@/lib/services/categories";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const [data, sess] = await Promise.all([
    req.json() as TCategoryUpdater,
    auth(),
  ]);

  if (!sess) return new Response(null, { status: 401 });
  if (!data.name && !data.description && !data.statusId)
    return new Response(null, { status: 400 });

  const [pp, user] = await Promise.all([params, currentUser(sess)]);
  const id = Number(pp.id);

  const cats = await getCatsIdsFor(user.id);
  if (!cats.some((cat) => cat.id === id))
    return new Response(null, { status: 403 });

  try {
    const updated = await updateCategory(id, user.id, {
      name: data.name,
      description: data.description,
      statusId: data.statusId,
    });
    if (!updated) return new Response(null, { status: 404 });

    return Response.json(updated!.get({ plain: true }));
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
