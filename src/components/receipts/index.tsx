"use client";

import Link from "next/link";

import { useGroupSelector } from "@/lib/hooks";
import useInfiniteScroll from "./hook";

import Header from "../header";
import Adder from "./adder";
import GroupSelector from "../groups/selector";
import Scrollers from "./scrollers";
import Individual from "./individual";

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

      <div className="p-2 flex flex-wrap justify-center items-center gap-2">
        {rs.groups.length > 0 &&
          rs.group!.receipts?.map((rcpt) =>
            rcpt.id === -1 ? null : <Individual key={rcpt.id} {...rcpt} />
          )}
      </div>

      <Scrollers />
    </>
  );
}
