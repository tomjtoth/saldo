"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rReceipts as red } from "@/lib/reducers/receipts";

export default function ItemRows() {
  const dispatch = useAppDispatch();
  const items = useAppSelector((s) => s.receipts.items);
  const categories = useAppSelector((s) => s.receipts.categories);

  return (
    <>
      <h3>Items</h3>
      <ul>
        {items.map((i) => (
          <li key={i.id}>
            <select
              value={i.catId}
              onChange={(ev) =>
                dispatch(
                  red.updateItem({
                    id: i.id,
                    catId: Number(ev.target.value),
                  })
                )
              }
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.description}
                </option>
              ))}
            </select>
            <input
              type="text"
              className="w-15"
              value={i.cost}
              onChange={(ev) =>
                dispatch(
                  red.updateItem({
                    id: i.id,
                    cost: Number(ev.target.value),
                  })
                )
              }
            />
            <input
              type="text"
              value={i.notes}
              onChange={(ev) =>
                dispatch(red.updateItem({ id: i.id, notes: ev.target.value }))
              }
            />
            <button onClick={() => dispatch(red.addRow(i.id))}>➕</button>
            {items.length > 1 && (
              <button onClick={() => dispatch(red.rmRow(i.id))}>➖</button>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
