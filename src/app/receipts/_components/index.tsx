"use client";

import { ReactNode, useEffect, useMemo } from "react";
import Link from "next/link";

import {
  useAppDispatch,
  useBodyNodes,
  useClientState,
  useDebugger,
} from "@/app/_lib/hooks";
import { useInfiniteScroll } from "../_lib/hook";
import { thunks } from "@/app/_lib/reducers";
import { appToast, virt } from "@/app/_lib/utils";

import Header from "@/app/_components/header";
import Scrollers from "./scrollers";
import ReceiptEntry from "./entry";
import ReceiptDetails from "./details";

export default function ReceiptsPage() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group");
  useInfiniteScroll();

  const receipt = group?.activeReceipt;

  useEffect(() => {
    if (typeof receipt?.id === "number") nodes.push(ReceiptDetails);
  }, [receipt?.id]);

  const receiptsListing = useMemo(
    () =>
      group?.receipts.map((rcpt) =>
        rcpt.id === -1 ? null : (
          <ReceiptEntry key={rcpt.id} receiptId={rcpt.id} />
        )
      ),
    [group?.receipts]
  );

  useDebugger({ receiptsListing });

  let adderButton: ReactNode = null;

  if (group) {
    const groupIsActive = virt(group).active;

    const activeCategories = group.categories.filter((c) => virt(c).active);

    adderButton =
      activeCategories.length > 0 ? (
        <button
          className={
            "inline-block" + (groupIsActive ? "" : " cursor-not-allowed!")
          }
          onClick={
            groupIsActive
              ? () => dispatch(thunks.setActiveReceipt(-1))
              : () =>
                  appToast.error(
                    "Cannot add new receipts to a disabled group, re-enable it first!"
                  )
          }
        >
          ➕ <span className="hidden sm:inline-block">Add new...</span>
        </button>
      ) : (
        <Link href={`/groups/${group?.id}/categories`}>
          🐱{" "}
          <span className="hidden sm:inline-block">
            Add/activate at least 1 category first
          </span>
        </Link>
      );
  }

  return (
    <>
      <Header>{adderButton}</Header>

      <ul className="p-2 flex flex-wrap justify-center items-center gap-2">
        {receiptsListing}
      </ul>

      <Scrollers />
    </>
  );
}
