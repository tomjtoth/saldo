"use client";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

export default function ItemRows() {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  );

  return !currReceipt ? null : (
    <>
      <h3>Items</h3>
      <ul className="flex flex-col gap-2">
        {currReceipt.items.map((i, rowIdx) => (
          <li key={i.id} className="flex gap-2 items-center justify-evenly">
            <select
              className="rounded border p-1 shrink"
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
              {rs.group()?.Categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>

            <textarea
              rows={1}
              placeholder="Optional comments..."
              className="resize-none hidden sm:block grow"
              value={i.notes}
              onChange={(ev) =>
                dispatch(
                  red.updateItem({
                    id: i.id,
                    notes: ev.target.value,
                  })
                )
              }
            />

            <form
              onSubmit={(ev) => {
                ev.preventDefault();
                if (!isNaN(Number(i.cost))) dispatch(red.addRow(i.id));
              }}
            >
              <input
                type="text"
                placeholder="cost"
                className="w-12 grow sm:grow-0"
                autoFocus={rowIdx === currReceipt.focusedIdx}
                value={i.cost}
                onChange={(ev) =>
                  dispatch(
                    red.updateItem({
                      id: i.id,
                      cost: ev.target.value.replace(",", "."),
                    })
                  )
                }
              />
            </form>

            <button className="p-1!" onClick={() => dispatch(red.addRow(i.id))}>
              ➕
            </button>
            {currReceipt.items.length > 1 && (
              <button
                className="p-1!"
                onClick={() => dispatch(red.rmRow(i.id))}
              >
                ➖
              </button>
            )}
          </li>
        ))}
      </ul>
      <h3 className="flex justify-between gap-2">
        <span>TOTAL</span>
        <span>
          €{" "}
          {currReceipt.items
            .reduce((sub, { cost }) => {
              const asNum = Number(cost);
              return sub + (isNaN(asNum) ? 0 : asNum);
            }, 0)
            .toFixed(2)}
        </span>
      </h3>
    </>
  );
}
