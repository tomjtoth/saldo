import { useEffect } from "react";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useClientState, useRootDivCx } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

const INFINITE_SCROLL = `INFINITE_SCROLL-${uuid()}`;

export default function useInfiniteScroll() {
  const cs = useClientState();
  const cx = useRootDivCx();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const rootDivH = cx.rootDivRef?.current?.scrollHeight ?? 0;

    if (
      !!cs.groupId &&
      (cs.group?.hasMoreToLoad ?? true) &&
      !cs.group?.fetchingReceipts &&
      (rootDivH < window.innerHeight ||
        cs.group?.debounceReceiptsFetching === 1)
    ) {
      dispatch(
        thunks.fetchReceipts(
          cs.groupId!,
          cs.group!.receipts.map(({ id }) => id)
        )
      );
    }

    return () => {
      // componentUnmounted = true;
    };
  }, [
    cs.group?.fetchingReceipts,
    cs.group?.debounceReceiptsFetching,
    cs.groupId,
  ]);

  useEffect(() => {
    cx.addOnScroll(INFINITE_SCROLL, (ev) => {
      const triggered =
        (window.innerHeight + ev.currentTarget.scrollTop) /
          ev.currentTarget.scrollHeight >
        0.8;

      if (triggered && !cs.group?.fetchingReceipts) {
        dispatch(thunks.tryFetchingReceipts());
        console.debug("scroll triggered");
      }
    });

    return () => cx.rmOnScroll(INFINITE_SCROLL);
  }, []);
}
