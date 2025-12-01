"use client";

import { useBodyNodes } from "@/app/_lib/hooks";
import { Item } from "@/app/receipts/_lib";

import Canceler from "@/app/_components/canceler";
import ItemOptions from ".";

export default function ItemOptionsAsModal({ itemId }: { itemId: Item["id"] }) {
  const nodes = useBodyNodes();

  return (
    <Canceler className="sm:hidden z-2" onClick={nodes.pop}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 " +
          "p-2 flex flex-wrap gap-2 justify-evenly"
        }
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) nodes.pop();
        }}
      >
        <ItemOptions {...{ itemId, hideModal: nodes.pop }} />
      </div>
    </Canceler>
  );
}
