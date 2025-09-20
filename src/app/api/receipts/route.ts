import protectedRoute from "@/lib/protectedRoute";
import { err } from "@/lib/utils";
import { addReceipt, TReceiptInput } from "@/lib/services/receipts";

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
