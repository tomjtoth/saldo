import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

import { useAppDispatch, useClientState, useRootDivCx } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { apiGetReceiptsData } from "../_lib";

const INFINITE_SCROLL = `INFINITE_SCROLL-${uuid()}`;

export default function useInfiniteScroll() {
  const cs = useClientState();
  const { addOnScroll, rmOnScroll, rootDivRef } = useRootDivCx();
  const dispatch = useAppDispatch();

  const [fetching, setFetching] = useState(false);
  const [debounce, setDebounce] = useState(0);
  const [hasMore, setHasMore] = useState<{ [groupId: number]: boolean }>({});

  useEffect(() => {
    const rootDivH = rootDivRef?.current?.scrollHeight ?? 0;

    if (
      !!cs.groupId &&
      (hasMore[cs.groupId] ?? true) &&
      !fetching &&
      (rootDivH < window.innerHeight || debounce === 1)
    ) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetching(true);
      const fetchedGroupId = cs.groupId;

      apiGetReceiptsData(
        cs.groups.flatMap((grp) => grp.receipts?.map((r) => r.id!) ?? [])
      ).then((groups) => {
        let updating = false;
        const limits = { ...hasMore };

        if (groups.length === 0) {
          updating = true;
          limits[fetchedGroupId] = false;
        }

        const storing = groups
          .map((group) => {
            const len = group.receipts?.length ?? 0;
            if (len < 50) {
              updating = true;
              limits[group.id!] = false;
            }

            return len > 0 ? true : false;
          })
          .some(Boolean);

        if (storing) dispatch(thunks.addFetchedReceipts(groups));

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
