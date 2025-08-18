import protectedRoute, { ReqWithUser } from "@/lib/protectedRoute";
import { err } from "@/lib/utils";
import {
  addReceipt,
  getReceipts,
  TReceiptInput,
} from "@/lib/services/receipts";

export const GET = protectedRoute(async (req: ReqWithUser) => {
  const { searchParams } = new URL(req.url);
  const knownIds = (searchParams.get("knownIds") ?? "").split(",").map(Number);

  if (knownIds.some(isNaN)) err("known ids contain NaN");

  const groups = await getReceipts(req.__user.id, knownIds);

  return Response.json(groups);
});

export const POST = protectedRoute(async (req: ReqWithUser) => {
  const { groupId, paidOn, paidBy, items }: TReceiptInput = await req.json();

  if (
    typeof groupId !== "number" ||
    typeof paidOn !== "string" ||
    typeof paidBy !== "number" ||
    !Array.isArray(items) ||
    items.length === 0
  )
    err();

  const rcpt = await addReceipt(req.__user.id, {
    groupId,
    paidOn,
    paidBy,
    items,
  });

  return Response.json(rcpt);
});
