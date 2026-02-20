import pluralize from "pluralize";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { vf } from "@/app/_lib/utils";
import { thunks } from "@/app/_lib/reducers";
import { Receipt } from "../_lib";

import UserAvatar from "@/app/_components/userAvatar";
import PaidByUserWithAvatar from "./paidByUserWithAvatar";
import ReceiptItemsSummary from "./summary";

export default function ReceiptEntry({
  receiptId,
  showSummary,
}: {
  receiptId: Receipt["id"];
  showSummary: boolean;
}) {
  const dispatch = useAppDispatch();
  const usersO1 = useClientState("users[id]");
  const receipt = useClientState("receipt", receiptId)!;
  const items = receipt.items;
  const activeItems = items.filter(vf.active);
  const activeVsInactiveDiff = activeItems.length - items.length;

  const isMultiUser = Object.keys(usersO1).length > 1;

  const addedBy =
    usersO1[
      receipt.archives.at(-1)?.revision.createdById ??
        receipt.revision.createdById
    ];

  return (
    <li
      onClick={() => dispatch(thunks.setActiveReceipt(receipt.id))}
      className="p-2 border rounded flex flex-col gap-2 cursor-pointer select-none"
    >
      <div className="flex gap-5 justify-between items-center">
        <b>{receipt.paidOn}</b>
        <PaidByUserWithAvatar userId={receipt.paidById} />
      </div>

      <div className="flex gap-5 justify-between items-center flex-row-reverse">
        <b>
          € {activeItems.reduce((sub, { cost }) => sub + cost, 0).toFixed(2)}
        </b>

        <div
          className={showSummary ? "cursor-zoom-out" : "cursor-zoom-in"}
          title={showSummary ? "hide items" : "show items"}
          onClick={(ev) => {
            ev.stopPropagation();
            dispatch(thunks.toggleReceiptItemsSummary(receiptId));
          }}
        >
          🛒
          <sup className="lg:hidden">{activeItems.length}</sup>
          <span className="hidden lg:inline-block">
            <sup>
              {receipt.items.length}
              {activeVsInactiveDiff !== 0 && ` (${activeVsInactiveDiff})`}
            </sup>{" "}
            {pluralize("item", activeItems.length)}
          </span>
        </div>

        {addedBy.id !== receipt.paidBy.id && (
          <div>
            <UserAvatar userId={addedBy.id} className="w-8" />
            <span className="hidden xl:inline-block ml-2">{addedBy.name}</span>
            <span className="hidden lg:inline-block ml-2">added</span>
          </div>
        )}
      </div>

      {showSummary && <ReceiptItemsSummary {...{ isMultiUser, items }} />}
    </li>
  );
}
