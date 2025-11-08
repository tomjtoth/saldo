"use client";

import { useEffect } from "react";
import Link from "next/link";

import { useAppDispatch, useClientState, useBodyNodes } from "@/app/_lib/hooks";
import useInfiniteScroll from "../_lib/hook";
import { thunks } from "@/app/_lib/reducers";

import Header from "@/app/_components/header";
import Scrollers from "./scrollers";
import Individual from "./individual";
import Details from "./details";

export default function CliReceiptsPage() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const cs = useClientState();
  useInfiniteScroll();

  const receipt = cs.group?.activeReceipt;

  useEffect(() => {
    if (typeof receipt?.id === "number") nodes.push(Details);
  }, [receipt?.id]);

  return (
    <>
      <Header>
        {(cs.group?.categories?.length ?? 0) > 0 ? (
          <button
            className="inline-block"
            onClick={() => dispatch(thunks.setActiveReceipt(-1))}
          >
            ➕ <span className="hidden sm:inline-block">Add new...</span>
          </button>
        ) : (
          <Link href={`/groups/${cs.group?.id}/categories`}>
            🐱{" "}
            <span className="hidden sm:inline-block">
              Add/activate at least 1 category first
            </span>
          </Link>
        )}
      </Header>

      <ul className="p-2 flex flex-wrap justify-center items-center gap-2">
        {cs.group?.receipts?.map((rcpt) =>
          rcpt.id === -1 ? null : <Individual key={rcpt.id} {...rcpt} />
        )}
      </ul>

      <Scrollers />
    </>
  );
}
