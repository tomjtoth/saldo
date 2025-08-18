import protectedRoute from "@/lib/protectedRoute";
import { err } from "@/lib/utils";
import {
  addReceipt,
  getReceipts,
  TReceiptInput,
} from "@/lib/services/receipts";

export const GET = protectedRoute(async (req) => {
  const { searchParams } = new URL(req.url);
  const knownIds = (searchParams.get("knownIds") ?? "").split(",").map(Number);

  if (knownIds.some(isNaN)) err("known ids contain NaN");

  return await getReceipts(req.__user.id, knownIds);
});

export const POST = protectedRoute(async (req) => {
  const { groupId, paidOn, paidBy, items }: TReceiptInput = await req.json();

  if (
    typeof groupId !== "number" ||
    typeof paidOn !== "string" ||
    typeof paidBy !== "number" ||
    !Array.isArray(items) ||
    items.length === 0
  )
    err();

  return await addReceipt(req.__user.id, {
    groupId,
    paidOn,
    paidBy,
    items,
  });
});
