"use client";

import Link from "next/link";

import { useGroupSelector } from "@/lib/hooks";

import Header from "../header";
import Adder from "./adder";
import GroupSelector from "../groups/selector";

export default function CliReceiptsPage() {
  const rs = useGroupSelector();

  return (
    <>
      <Header className="flex gap-2">
        <h2>Receipts</h2>
      </Header>

      {rs.groups.length > 0 ? (
        <div className="p-2 text-center">
          <Adder /> receipt for group: <GroupSelector />
        </div>
      ) : (
        <p>
          You have no access to active groups currently,{" "}
          <Link href="/groups">create or enable one</Link>!
        </p>
      )}

      <div className="p-2 flex flex-wrap justify-evenly items-center gap-2">
        {rs.groups.length == 0 ? null : (
          <>
            {rs.group()?.Receipts?.map((rcpt) => (
              <div
                key={rcpt.id}
                className="p-2 shrink-0 border rounded flex gap-2 cursor-pointer select-none"
              >
                <span>🛍️ {rcpt.Items?.length}: </span>

                <span>
                  €{" "}
                  {rcpt.Items?.reduce((sub, { cost }) => sub + cost, 0).toFixed(
                    2
                  )}
                </span>

                <span>🗓️ {rcpt.paidOn}</span>

                <span>
                  🪪{" "}
                  {rcpt.archives!.length > 0
                    ? rcpt.archives?.at(0)?.Revision?.User?.name
                    : rcpt.Revision?.User?.name}
                </span>

                <span>💸 {rcpt.User?.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
