"use client";

import {
  useAppDispatch,
  useGroupSelector,
  useBodyNodes,
} from "@/app/_lib/hooks";
import { rCombined as red } from "@/app/_lib/reducers";

import Canceler from "@/app/_components/canceler";
import ItemShareSetter from "../shares/setter";
import ItemShareAvatar from "../shares/avatar";

export default function Options({
  itemId,
  hideModal,
}: {
  itemId: number;
  hideModal?: () => void;
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = rs.group!.activeReceipt!;

  const nodes = useBodyNodes();
  const showSetter = () => {
    nodes.push(
      <Canceler
        key="options"
        className={
          "z-2" + (hideModal ? " backdrop-opacity-100 bg-background/50" : "")
        }
        onClick={nodes.pop}
      >
        <ItemShareSetter {...{ itemId }} />
      </Canceler>
    );
  };

  const item = currReceipt.items!.find((item) => item.id === itemId);

  if (!item) return null;

  const users = rs.users;
  const isMultiUser = users.length > 1;
  const shares = item.itemShares;

  return (
    <>
      <textarea
        rows={1}
        placeholder="Optional comments..."
        className="resize-none grow bg-background"
        value={item.notes ?? ""}
        onChange={(ev) =>
          dispatch(
            red.updateItem({
              id: item.id!,
              notes: ev.target.value,
            })
          )
        }
      />

      {isMultiUser &&
        ((shares?.reduce((sum, { share }) => sum + (share ?? 0), 0) ?? 0) >
        0 ? (
          <div
            className="flex gap-2 cursor-pointer mr-2 mb-2 sm:mb-0 items-center justify-evenly"
            onClick={showSetter}
          >
            {shares!.map(({ userId, share }) =>
              share === 0 ? null : (
                <ItemShareAvatar
                  key={`${item.id}-${userId}`}
                  user={users.find((user) => user.id === Number(userId))!}
                  value={share!}
                />
              )
            )}
          </div>
        ) : (
          <button
            className="bg-background inline-flex items-center gap-2"
            onClick={showSetter}
          >
            <>
              <span className="sm:hidden xl:block">
                {"Edit shares".replaceAll(" ", "\u00A0")}
              </span>
              👪
            </>
          </button>
        ))}

      {currReceipt.items!.length > 1 && (
        <button
          className="inline-flex items-center gap-2 bg-background"
          onClick={() => {
            dispatch(red.rmRow(item.id!));
            if (hideModal) hideModal();
          }}
        >
          <span className="sm:hidden xl:block">
            {"Remove this row".replaceAll(" ", "\u00A0")}
          </span>
          ➖
        </button>
      )}

      <button
        className="inline-flex items-center gap-2 col-start-5 bg-background"
        onClick={() => {
          dispatch(red.addRow(item.id));
          if (hideModal) hideModal();
        }}
      >
        <span className="sm:hidden xl:block">
          {"Add row below".replaceAll(" ", "\u00A0")}
        </span>{" "}
        ➕
      </button>
    </>
  );
}
