"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import useInfiniteScroll from "./hook";
import { rCombined } from "@/lib/reducers";
import { useBodyNodes } from "../bodyNodes";

import Header from "../header";
import GroupSelector from "../groups/selector";
import Scrollers from "./scrollers";
import Individual from "./individual";
import Details from "./details";

export default function CliReceiptsPage() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const rs = useGroupSelector();
  useInfiniteScroll();

  const receipt = rs.group?.activeReceipt;

  useEffect(() => {
    if (typeof receipt?.id === "number") nodes.push(<Details key="details" />);
  }, [receipt?.id]);

  return (
    <>
      <Header>
        <h2>Receipts</h2>
      </Header>

      {rs.groups.length > 0 ? (
        <div className="p-2 text-center">
          <button
            className="inline-block"
            onClick={() => dispatch(rCombined.setActiveReceipt(-1))}
          >
            ➕ Add new...
          </button>{" "}
          receipt for group: <GroupSelector />
        </div>
      ) : (
        <p>
          You have no access to active groups currently,{" "}
          <Link href="/groups">create or enable one</Link>!
        </p>
      )}

      <ul className="p-2 flex flex-wrap justify-center items-center gap-2">
        {rs.groups.length > 0 &&
          rs.group!.receipts?.map((rcpt) =>
            rcpt.id === -1 ? null : <Individual key={rcpt.id} {...rcpt} />
          )}
      </ul>

      <Scrollers />
    </>
  );
}
