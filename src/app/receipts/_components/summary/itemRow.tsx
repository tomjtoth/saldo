import { useClientState } from "@/app/_lib/hooks";

import { Item } from "../../_lib";
import ItemShareOverview from "../details/itemRow/options/shares";

export default function ItemRowSummary({
  item,
  isMultiUser,
}: {
  item: Item;
  isMultiUser: boolean;
}) {
  const cats = useClientState("categories[id]");

  return (
    <li
      className={"grid gap-2 " + (isMultiUser ? "grid-cols-4" : "grid-cols-3")}
    >
      <div>{cats[item.categoryId].name}</div>

      <p className="truncate max-w-25 sm:max-w-50">{item.notes}</p>

      {isMultiUser && (
        <ItemShareOverview shares={item.itemShares} hideAdderButton />
      )}

      <div className="text-right col-start-4">€ {item.cost.toFixed(2)}</div>
    </li>
  );
}
