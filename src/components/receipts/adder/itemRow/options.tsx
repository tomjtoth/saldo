"use client";

import { useAppDispatch, useAppSelector, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { useModal } from "..";

import Canceler from "@/components/canceler";
import ItemShareSetter from "./shares/setter";
import ItemShareAvatar from "./shares/avatar";

export default function Options({
  itemId,
  hideModal,
}: {
  itemId: number;
  hideModal?: () => void;
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();
  const currReceipt = useAppSelector((s) =>
    rs.groupId ? s.combined.newReceipts[rs.groupId] : undefined
  )!;

  const { setModal } = useModal();
  const showSetter = () => {
    setModal(
      <Canceler
        className={
          "z-2" + (hideModal ? " backdrop-opacity-100 bg-background/50" : "")
        }
        onClick={() => setModal(null)}
      >
        <ItemShareSetter {...{ itemId }} />
      </Canceler>
    );
  };

  const item = currReceipt.items.find((item) => item.id === itemId)!;

  const users = rs.group()?.Users;
  const isMultiUser = (users?.length ?? 0) > 1;
  const shares = Object.entries(item.shares).filter(([, val]) => !!val);

  return (
    <>
      <textarea
        rows={1}
        placeholder="Optional comments..."
        className="resize-none grow bg-background"
        value={item.notes}
        onChange={(ev) =>
          dispatch(
            red.updateItem({
              id: item.id,
              notes: ev.target.value,
            })
          )
        }
      />

      {isMultiUser &&
        (shares.length > 0 ? (
          <div
            className="flex gap-2 cursor-pointer mr-2 mb-2 sm:mb-0 items-center justify-evenly"
            onClick={showSetter}
          >
            {shares.map(([userId, share]) =>
              share === 0 ? null : (
                <ItemShareAvatar
                  key={`${item.id}-${userId}`}
                  user={users!.find((user) => user.id === Number(userId))!}
                  value={share}
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

      {currReceipt.items.length > 1 && (
        <button
          className="inline-flex items-center gap-2 bg-background"
          onClick={() => {
            dispatch(red.rmRow(item.id));
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
