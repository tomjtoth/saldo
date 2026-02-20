"use client";

import { useClientState } from "@/app/_lib/hooks";
import { vf } from "@/app/_lib/utils";

import ReceiptEntry from "./entry";

export default function ReceiptsTemplateListing() {
  const group = useClientState("group");

  const templates = group?.receipts.filter(vf.template) ?? [];

  return !templates.length ? null : (
    <div className="p-2 gap-2">
      <h4 className="text-center text-5xl border rounded w-full my-2 py-2">
        Templates
        <span className="hidden sm:not-so-hidden">
          TODO: some more metrics here
        </span>
      </h4>

      <ul
        className={
          "*:mb-4 *:py-2 *:break-inside-avoid columns-2 " +
          "lg:columns-3 xl:columns-4 2xl:columns-5"
        }
      >
        {templates.map((rcpt) => (
          <ReceiptEntry
            key={rcpt.id}
            {...{ showSummary: true, receiptId: rcpt.id }}
          />
        ))}
      </ul>
    </div>
  );
}
