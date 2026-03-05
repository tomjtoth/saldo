"use client";

import { useEffect, useMemo } from "react";
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

  const receipts = group?.receipts ?? [];
  const someReceiptsAreDeleted = !receipts.every(vf.active);

  const showDeletedReceipts = useAppSelector(
    (s) => s.combined.showDeletedReceipts,
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

  return (
    <>
      <Header>
        {activeCategories.length > 0 ? (
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

            {receipts.length > 0 && (
              <>
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

                {someReceiptsAreDeleted && (
                  <button
                    className="ml-2 "
                    onClick={() =>
                      dispatch(thunks.toggleDeletedReceiptsVisibility())
                    }
                  >
                    <span className="relative">
                      🗑️<sub className="absolute -bottom-1 -right-2">🧾</sub>
                    </span>

                    <span className="max-sm:hidden ml-2">
                      {showDeletedReceipts ? "Hide" : "Show"}{" "}
                      <span className="max-md:hidden">deleted</span> receipts
                    </span>
                  </button>
                )}
              </>
            )}
          </>
        ) : (
          <Link href={`/groups/${group?.id}/categories`}>
            🐱{" "}
            <span className="hidden sm:inline-block">
              Add/activate at least 1 category first
            </span>
          </Link>
        )}
      </Header>

      <ReceiptsTemplateListing />

      <ReceiptsMainListing />

      <Scrollers />
    </>
  );
}
