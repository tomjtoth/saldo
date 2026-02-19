"use client";

import { useMemo, Fragment } from "react";

import { useAppSelector, useClientState, useDebugger } from "@/app/_lib/hooks";
import { vf } from "@/app/_lib/utils";
import { Receipt } from "../_lib";

import ReceiptEntry from "./entry";

export default function ReceiptsMainListing() {
  const group = useClientState("group");

  const shownSummaries = useAppSelector(
    (s) => s.combined.showReceiptItemsSummary,
  );

  const memoizedList = useMemo(() => {
    const byMonth = new Map<string, Receipt[]>();

    for (const rcpt of group?.receipts ?? []) {
      // TODO: stop inserting the -1 id dummy into receipts...
      // "add" it only on clicking the add new :D
      if (rcpt.id === -1 || vf(rcpt).template) continue;

      const month = rcpt.paidOn.slice(0, 7);

      if (!byMonth.has(month)) {
        byMonth.set(month, []);
      }

      byMonth.get(month)!.push(rcpt);
    }

    return Array.from(byMonth).map(([month, receipts]) => (
      <Fragment key={month}>
        <h4 className="text-center text-5xl border rounded w-full my-2 py-2">
          {month}
          <span className="hidden sm:not-so-hidden">
            TODO: some more metrics here
          </span>
        </h4>

        <ul
          className={
            "*:mb-4 *:py-2 *:break-inside-avoid columns-1 " +
            "md:columns-2 lg:columns-3 xl:columns-4 2xl:columns-5"
          }
        >
          {receipts.map((rcpt) => (
            <ReceiptEntry
              key={rcpt.id}
              {...{
                showSummary: shownSummaries[-1] || shownSummaries[rcpt.id],
                receiptId: rcpt.id,
              }}
            />
          ))}
        </ul>
      </Fragment>
    ));
  }, [group?.receipts, shownSummaries]);

  useDebugger({ receiptsListing: memoizedList });

  return <div className="p-2 gap-2">{memoizedList}</div>;
}
