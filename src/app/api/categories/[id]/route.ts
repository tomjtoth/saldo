import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { updateCategory } from "@/lib/services/categories";

type Params = {
  params: {
    id: string;
  };
};

export async function PUT(req: NextRequest, { params }: Params) {
  const data = await req.json();

  const sess = await auth();

  if (!sess) {
    return new Response(null, { status: 401 });
  }

  const user = await currentUser(sess);

  const categoryId = parseInt(params.id);

  try {
    const updated = await updateCategory(categoryId, user.id, data);

    return Response.json({ updated: updated!.get({ plain: true }) });
  } catch (err) {
    return Response.error();
  }
}
