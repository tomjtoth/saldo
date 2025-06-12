"use client";

import { TReceipt } from "@/lib/models";

export function CliReceiptsPage({ receipts }: { receipts: TReceipt[] }) {
  return (
    <div className="p-2 flex flex-wrap justify-evenly items-center gap-2 overflow-clip">
      {receipts.map((rcpt) => (
        <div
          key={rcpt.id}
          className="p-2 shrink-0 border rounded flex gap-2 cursor-pointer select-none"
        >
          <span>
            🛍️
            <sub>{rcpt.items?.length}</sub>
          </span>

          <span>
            🗓️
            <sub>{rcpt.paidOn}</sub>
          </span>

          <span>
            🪪
            <sub>
              {rcpt.archives!.length > 0
                ? rcpt.archives?.at(0)?.Revision?.User?.name
                : rcpt.Revision?.User?.name}
            </sub>
          </span>

          <span>
            💸
            <sub>{rcpt.User?.name}</sub>
          </span>
        </div>
      ))}
    </div>
  );
}
