import pluralize from "pluralize";

import { TReceipt } from "@/app/_lib/db";
import { virt } from "@/app/_lib/utils";
import { useAppDispatch } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import UserAvatar from "@/app/_components/userAvatar";
import PaidByUserWithAvatar from "./paidByUserWithAvatar";

export default function Individual(rcpt: TReceipt) {
  const dispatch = useAppDispatch();
  const activeItems = rcpt.items!.filter((item) => virt(item).active);
  const activeVsInactiveDiff = activeItems.length - rcpt.items!.length;

  const addedBy =
    rcpt.archives!.length > 0
      ? rcpt.archives?.at(0)?.revision?.createdBy
      : rcpt.revision?.createdBy;

  return (
    <li
      key={rcpt.id}
      onClick={() => dispatch(thunks.setActiveReceipt(rcpt.id!))}
      className="p-2 shrink-0 border rounded flex w-fit flex-col gap-2 cursor-pointer select-none"
    >
      <div className="flex gap-5 justify-between items-center">
        <b>{rcpt.paidOn}</b>
        <PaidByUserWithAvatar {...rcpt.paidBy} />
      </div>

      <div className="flex gap-5 justify-between items-center flex-row-reverse">
        <b>
          € {activeItems.reduce((sub, { cost }) => sub + cost!, 0).toFixed(2)}
        </b>

        <div>
          🛒
          <sup className="lg:hidden">{activeItems.length}</sup>
          <span className="hidden lg:inline-block">
            <sup>
              {rcpt.items?.length}
              {activeVsInactiveDiff !== 0 && ` (${activeVsInactiveDiff})`}
            </sup>{" "}
            {pluralize("item", activeItems.length)}
          </span>
        </div>

        {addedBy!.id !== rcpt.paidBy!.id && (
          <div>
            <UserAvatar user={addedBy!} className="w-8" />
            <span className="hidden xl:inline-block ml-2">{addedBy!.name}</span>
            <span className="hidden lg:inline-block ml-2">added</span>
          </div>
        )}
      </div>
    </li>
  );
}
