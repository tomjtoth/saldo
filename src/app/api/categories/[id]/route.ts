import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { updateCategory } from "@/lib/services/categories";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
  const [data, sess] = await Promise.all([req.json(), auth()]);
  if (!sess) return new Response(null, { status: 401 });

  const [{ id }, user] = await Promise.all([params, currentUser(sess)]);

  try {
    const updated = await updateCategory(id, user.id, data);

    return Response.json({ updated: updated!.get({ plain: true }) });
  } catch (err) {
    console.error(err);
    return new Response(null, { status: 400 });
  }
}
