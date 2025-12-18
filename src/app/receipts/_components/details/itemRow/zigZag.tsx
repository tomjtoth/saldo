import { useMemo } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { Item } from "@/app/receipts/_lib";
import { thunks } from "@/app/_lib/reducers";

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function ItemRowZigZag({ itemId }: { itemId: Item["id"] }) {
  const dispatch = useAppDispatch();
  const items = useClientState("group")!.activeReceipt!.items;
  const itemIdx = items.findIndex((i) => i.id === itemId);

  const points = useMemo(() => {
    const rand = mulberry32(itemId + itemIdx + items.length);
    const res: string[] = [];

    const segments =
      40 + (itemId % (Math.ceil(items.length * rand()) + 1)) * rand() * 10; // visual density
    for (let i = 0; i <= segments; i++) {
      const x = (i / segments) * 100 + rand() * 2 - 1;
      const baseY = i % 2 === 0 ? 7.5 : 0.5;
      const y = baseY + rand() * 2;
      res.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }

    return res.join(" ");
  }, [itemId, itemIdx, items.length]);

  return (
    <svg
      className="absolute w-full h-full"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden
      onClick={() => dispatch(thunks.rmItem(itemId))}
    >
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="0.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
