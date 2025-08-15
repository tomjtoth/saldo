"use client";

import Link from "next/link";

import { useGroupSelector } from "@/lib/hooks";
import useInfiniteScroll from "./hook";

import Header from "../header";
import Adder from "./adder";
import GroupSelector from "../groups/selector";
import Scrollers from "./scrollers";

export default function CliReceiptsPage() {
  const rs = useGroupSelector();
  useInfiniteScroll();

  return (
    <>
      <Header>
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

      <div className="p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-evenly items-center gap-2">
        {rs.groups.length === 0 ? null : (
          <>
            {rs.group()?.receipts?.map((rcpt) => (
              <div
                key={rcpt.id}
                className="p-2 shrink-0 border rounded flex gap-2 cursor-pointer select-none justify-between"
              >
                <span>
                  🗓️
                  <sub>{rcpt.paidOn}</sub>
                </span>

                <span>
                  🛍️ <sub>{rcpt.items?.length}</sub>
                </span>

                <span>
                  €{" "}
                  <sub>
                    {rcpt.items
                      ?.reduce((sub, { cost }) => sub + cost!, 0)
                      .toFixed(2)}
                  </sub>
                </span>

                <span className="hidden lg:block">
                  🪪{" "}
                  <sub>
                    {rcpt.archives!.length > 0
                      ? rcpt.archives?.at(0)?.revision?.createdBy?.name
                      : rcpt.revision?.createdBy?.name}
                  </sub>
                </span>

                <span className="hidden lg:block">
                  💸 <sub>{rcpt.paidBy?.name}</sub>
                </span>
              </div>
            ))}
          </>
        )}
      </div>

      <Scrollers />
    </>
  );
}
