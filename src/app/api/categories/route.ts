import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import {
  createCategory,
  TCategoryUpdater,
  updateCategory,
  userAccessToCat,
} from "@/lib/services/categories";
import { TCategory, TCrCategory } from "@/lib/models";
import { updateMembership } from "@/lib/services/groups";

export async function POST(req: NextRequest) {
  const data = (await req.json()) as TCrCategory;
  if (data.name === undefined) return new Response(null, { status: 401 });

  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });
  const user = await currentUser(sess);

  const cat = await createCategory(user.id, {
    groupId: data.groupId,
    name: data.name,
    description: data.description,
  });
  return Response.json(cat.get({ plain: true }));
}

export async function PUT(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const data: TCategoryUpdater &
    Pick<TCategory, "id" | "groupId"> & {
      setAsDefault?: true;
    } = await req.json();
  if (
    !data.id ||
    !data.groupId ||
    (!data.name && !data.description && !data.statusId && !data.setAsDefault)
  ) {
    return new Response(null, { status: 400 });
  }

  const user = await currentUser(sess);

  if (!(await userAccessToCat(user.id, data.id)))
    return new Response(null, { status: 403 });

  try {
    if (data.setAsDefault) {
      await updateMembership(user.id, {
        userId: user.id,
        groupId: data.groupId,
        defaultCatId: data.id,
      });

      return new Response(null, { status: 200 });
    }

    const updated = await updateCategory(data.id, user.id, {
      name: data.name,
      description: data.description,
      statusId: data.statusId,
    });

    return Response.json(updated!.get({ plain: true }));
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
