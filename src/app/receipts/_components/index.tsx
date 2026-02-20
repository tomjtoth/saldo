"use client";

import { ReactNode, useEffect, useMemo } from "react";
import Link from "next/link";

import {
  useAppDispatch,
  useAppSelector,
  useBodyNodes,
  useClientState,
} from "@/app/_lib/hooks";
import { useInfiniteScroll } from "../_lib/hook";
import { thunks } from "@/app/_lib/reducers";
import { appToast, vf } from "@/app/_lib/utils";

import Header from "@/app/_components/header";
import Scrollers from "./scrollers";
import ReceiptsMainListing from "./listing";
import ReceiptDetails from "./details";
import ReceiptsTemplateListing from "./templateListing";

export default function ReceiptsPage() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const group = useClientState("group");
  useInfiniteScroll();

  const showSummary = useAppSelector(
    (s) => (-1) in s.combined.showReceiptItemsSummary,
  );

  const receipt = group?.activeReceipt;

  useEffect(() => {
    if (typeof receipt?.id === "number") nodes.push(ReceiptDetails);
  }, [receipt?.id]);

  const groupIsActive = useMemo(() => group && vf(group).active, [group]);

  const activeCategories = useMemo(
    () => group?.categories.filter(vf.active) ?? [],
    [group?.categories],
  );

  let adderButton: ReactNode = null;

  if (group) {
    adderButton =
      activeCategories.length > 0 ? (
        <>
          <button
            className={
              "inline-block" + (groupIsActive ? "" : " cursor-not-allowed!")
            }
            onClick={
              groupIsActive
                ? () => dispatch(thunks.setActiveReceipt(-1))
                : () =>
                    appToast.error(
                      "Cannot add new receipts to a disabled group, re-enable it first!",
                    )
            }
          >
            ➕ <span className="hidden sm:inline-block">Add new...</span>
          </button>

          <button
            className="ml-2"
            onClick={() => dispatch(thunks.toggleReceiptItemsSummary(-1))}
          >
            <span className="relative">
              🔎
              <sub className="text-xs -bottom-2 -right-2 absolute ">
                {showSummary ? "➖" : "➕"}
              </sub>
            </span>{" "}
            <span className="hidden sm:inline-block ml-2">
              {showSummary ? "Hide" : "Show"} items
            </span>
          </button>
        </>
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

      <ReceiptsTemplateListing />

      <ReceiptsMainListing />

      <Scrollers />
    </>
  );
}
