import { NextRequest } from "next/server";

import { auth } from "@/auth";
import { currentUser } from "@/lib/services/user";
import {
  addReceipt,
  getReceiptsDataFor,
  TReceiptInput,
} from "@/lib/services/receipt";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const { searchParams } = new URL(req.url);
  const knownIds = (searchParams.get("knownIds") ?? "").split(",").map(Number);

  if (knownIds.some(isNaN)) return new Response(null, { status: 400 });

  const user = await currentUser(sess);
  const groups = await getReceiptsDataFor(user.id, knownIds);

  return Response.json(groups);
}

export async function POST(req: NextRequest) {
  const data: TReceiptInput = await req.json();
  // TODO: preliminary validation of sent data here
  if (data.items.length === 0) return new Response(null, { status: 400 });

  const sess = await auth();
  if (!sess) return new Response(null, { status: 401 });

  const user = await currentUser(sess);

  try {
    const rcpt = await addReceipt(user.id, {
      groupId: data.groupId,
      paidOn: data.paidOn,
      paidBy: data.paidBy,
      items: data.items,
    });
    return Response.json(rcpt);
  } catch (err) {
    return new Response(null, {
      status: 400,
      statusText: (err as Error).message,
    });
  }
}
