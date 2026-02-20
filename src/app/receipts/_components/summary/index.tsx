import { vf } from "@/app/_lib/utils";
import { Item } from "../../_lib";

import ItemRowSummary from "./itemRow";

export default function ReceiptItemsSummary({
  items,
  isMultiUser,
}: {
  items: Item[];
  isMultiUser: boolean;
}) {
  return (
    <>
      <hr />
      <ul>
        {items.map((item) =>
          !vf(item).active ? null : (
            <ItemRowSummary key={item.id} {...{ item, isMultiUser }} />
          ),
        )}
      </ul>
    </>
  );
}
