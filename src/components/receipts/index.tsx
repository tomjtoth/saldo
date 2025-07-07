"use client";

import { useState } from "react";
import Link from "next/link";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { useRootDivCx } from "../rootDiv/clientSide";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";

import Header from "../header";
import Adder from "./adder";
import GroupSelector from "../groups/selector";

export default function CliReceiptsPage() {
  const rs = useGroupSelector();
  const { setOnScroll } = useRootDivCx();
  const dispatch = useAppDispatch();

  const [fetching, setFetching] = useState(false);
  const [hasMore, setHasMore] = useState<{ [groupId: number]: boolean }>({});

  function processFetchedReceipts(groups: TGroup[]) {
    const storing = groups
      .map((group) => {
        const len = group.Receipts?.length ?? 0;
        if (len < 50)
          setHasMore({
            ...hasMore,
            [group.id]: false,
          });

        return len > 0 ? true : false;
      })
      .some(Boolean);

    if (storing) dispatch(red.addFetchedReceipts(groups));

    setFetching(false);
  }

  setOnScroll(async (ev) => {
    const triggered =
      window.innerHeight + ev.currentTarget.scrollTop + 500 >
      ev.currentTarget.scrollHeight;

    if (
      triggered &&
      !!rs.groupId &&
      (hasMore[rs.groupId] ?? true) &&
      !fetching
    ) {
      setFetching(true);
      const body = await fetch(
        `/api/receipts?knownIds=${rs.groups
          .flatMap((grp) => grp.Receipts?.map((r) => r.id))
          .join(",")}`
      );
      const groups: TGroup[] = await body.json();
      processFetchedReceipts(groups);
    }
  });

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

      <div className="p-2 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 justify-evenly items-center gap-2">
        {rs.groups.length == 0 ? null : (
          <>
            {rs.group()?.Receipts?.map((rcpt) => (
              <div
                key={rcpt.id}
                className="p-2 shrink-0 border rounded flex gap-2 cursor-pointer select-none justify-between"
              >
                <span>
                  🗓️
                  <sub>{rcpt.paidOn}</sub>
                </span>

                <span>
                  🛍️ <sub>{rcpt.Items?.length}</sub>
                </span>

                <span>
                  €{" "}
                  <sub>
                    {rcpt.Items?.reduce(
                      (sub, { cost }) => sub + cost,
                      0
                    ).toFixed(2)}
                  </sub>
                </span>

                <span className="hidden lg:block">
                  🪪{" "}
                  <sub>
                    {rcpt.archives!.length > 0
                      ? rcpt.archives?.at(0)?.Revision?.User?.name
                      : rcpt.Revision?.User?.name}
                  </sub>
                </span>

                <span className="hidden lg:block">
                  💸 <sub>{rcpt.User?.name}</sub>
                </span>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
