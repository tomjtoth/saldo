"use client";

import { useEffect } from "react";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useClientState, useRootDivCx } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

const INFINITE_SCROLL = `INFINITE_SCROLL-${uuid()}`;

export function useInfiniteScroll() {
  const group = useClientState("group");
  const groupId = group?.id;
  const cx = useRootDivCx();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const rootDivH = cx.rootDivRef?.current?.scrollHeight ?? 0;

    if (
      !!groupId &&
      (group?.hasMoreToLoad ?? true) &&
      !group?.fetchingReceipts &&
      (rootDivH < window.innerHeight || group?.debounceReceiptsFetching === 1)
    ) {
      const ids = group!.receipts.map((r) => r.id);

      dispatch(
        thunks.fetchReceipts(groupId!, {
          max: Math.max(...ids),
          min: Math.min(...ids),
        }),
      );
    }

    return () => {
      // componentUnmounted = true;
    };
  }, [group?.fetchingReceipts, group?.debounceReceiptsFetching, groupId]);

  useEffect(() => {
    cx.addOnScroll(INFINITE_SCROLL, (ev) => {
      const triggered =
        (window.innerHeight + ev.currentTarget.scrollTop) /
          ev.currentTarget.scrollHeight >
        0.8;

      if (triggered && !group?.fetchingReceipts) {
        dispatch(thunks.tryFetchingReceipts());
        console.debug("scroll triggered");
      }
    });

    return () => cx.rmOnScroll(INFINITE_SCROLL);
  }, []);
}
