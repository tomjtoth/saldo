import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import { addReceipt } from "@/lib/services/receipt";

export async function POST(req: NextRequest) {
  const data = await req.json();
  // TODO: preliminary validation of sent data here
  if (data.items.length === 0) return new Response(null, { status: 400 });

  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const user = await currentUser(sess);

  try {
    const {
      rcpt: { id },
    } = await addReceipt(user.id, data);
    Response.json(id);
  } catch (err) {
    return Response.error();
  }
}
