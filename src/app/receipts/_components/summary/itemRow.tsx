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
    <li className={"flex gap-2 justify-between"}>
      <div className="truncate">{cats[item.categoryId].name}</div>

      <p className="truncate hidden sm:block ">{item.notes}</p>

      {isMultiUser && (
        <ItemShareOverview shares={item.itemShares} hideAdderButton />
      )}

      <div className="text-right col-start-4 whitespace-nowrap">
        € {item.cost.toFixed(2)}
      </div>
    </li>
  );
}
