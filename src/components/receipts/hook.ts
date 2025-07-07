import { useEffect, useRef, useState } from "react";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { useRootDivCx } from "../rootDiv/clientSide";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";

const INFINITE_SCROLL = `INFINITE_SCROLL-${uuid()}`;

export default function useInfiniteScroll() {
  const rs = useGroupSelector();
  const { addOnScroll, rmOnScroll, rootDivRef } = useRootDivCx();
  const dispatch = useAppDispatch();

  const [fetching, setFetching] = useState(false);
  const [debounce, setDebounce] = useState(0);
  const [hasMore, setHasMore] = useState<{ [groupId: number]: boolean }>({});

  useEffect(() => {
    const rootDivH = rootDivRef?.current?.scrollHeight ?? 0;

    if (
      !!rs.groupId &&
      (hasMore[rs.groupId] ?? true) &&
      !fetching &&
      (rootDivH < window.innerHeight || debounce === 1)
    ) {
      setFetching(true);
      fetch(
        `/api/receipts?knownIds=${rs.groups
          .flatMap((grp) => grp.Receipts?.map((r) => r.id))
          .join(",")}`
      ).then(async (body) => {
        const groups: TGroup[] = await body.json();
        let updating = false;
        const limits = { ...hasMore };

        const storing = groups
          .map((group) => {
            const len = group.Receipts?.length ?? 0;
            if (len < 50) {
              updating = true;
              limits[group.id] = false;
            }

            return len > 0 ? true : false;
          })
          .some(Boolean);

        if (storing) dispatch(red.addFetchedReceipts(groups));

        if (updating) setHasMore(limits);
        setFetching(false);
        setDebounce(0);
      });
    }
  }, [fetching, debounce]);

  useEffect(() => {
    addOnScroll(INFINITE_SCROLL, (ev) => {
      const triggered =
        window.innerHeight + ev.currentTarget.scrollTop + 1500 >
        ev.currentTarget.scrollHeight;

      if (triggered) setDebounce(debounce + 1);
    });

    return () => rmOnScroll(INFINITE_SCROLL);
  }, []);
}
