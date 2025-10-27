import { useState } from "react";
import pluralize from "pluralize";

import { TReceipt } from "@/lib/db";
import { virt } from "@/lib/utils";

import Updater from "./updater";
import Canceler from "../canceler";
import UserAvatar from "../userAvatar";

export default function Individual(rcpt: TReceipt) {
  const [showUpdater, setShowUpdater] = useState(false);

  const activeItems = rcpt.items!.filter((item) => virt(item).active);
  const activeVsInactiveDiff = activeItems.length - rcpt.items!.length;

  const addedBy =
    rcpt.archives!.length > 0
      ? rcpt.archives?.at(0)?.revision?.createdBy
      : rcpt.revision?.createdBy;

  const hideUpdater = () => setShowUpdater(false);

  return (
    <>
      {showUpdater && (
        <Canceler onClick={hideUpdater}>
          <Updater {...rcpt} hide={hideUpdater} />
        </Canceler>
      )}

      <div
        key={rcpt.id}
        onClick={() => setShowUpdater(true)}
        className="p-2 shrink-0 border rounded flex w-fit flex-col gap-2 cursor-pointer select-none"
      >
        <div className="flex gap-5 justify-between items-center">
          <b>{rcpt.paidOn}</b>
          <div>
            <span className="hidden lg:inline-block mr-2">paid by</span>
            <span className="hidden xl:inline-block mr-2">
              {rcpt.paidBy?.name}
            </span>
            <UserAvatar {...rcpt.paidBy} className="w-10" />
          </div>
        </div>

        <div className="flex gap-5 justify-between items-center flex-row-reverse">
          <b>
            € {activeItems.reduce((sub, { cost }) => sub + cost!, 0).toFixed(2)}
          </b>

          <div>
            🛒
            {/* 🛍️ */}
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
              <UserAvatar {...addedBy} className="w-8" />
              <span className="hidden xl:inline-block ml-2">
                {addedBy?.name}
              </span>
              <span className="hidden lg:inline-block ml-2">added</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
