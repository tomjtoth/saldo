import { Item } from "@/app/receipts/_lib";

import ItemShareAvatar from "./avatar";
import { KeyboardEventHandler, RefObject } from "react";

export default function ItemShareOverview({
  shares,
  showSetter,
  onKeyDown,
  ref,
  hideAdderButton,
}: {
  shares: Item["itemShares"];
  showSetter?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLDivElement>;
  ref?: RefObject<HTMLDivElement | null>;
  hideAdderButton?: boolean;
}) {
  return shares.reduce((sum, { share }) => sum + share, 0) > 0 ? (
    <div
      ref={ref}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className="flex gap-2 cursor-pointer mr-2 mb-2 sm:mb-0 items-center justify-evenly"
      onClick={showSetter}
    >
      {shares.map(({ userId, share }) =>
        share === 0 ? null : (
          <ItemShareAvatar key={userId} userId={userId} value={share} />
        ),
      )}
    </div>
  ) : hideAdderButton ? null : (
    <div
      ref={ref}
      onKeyDown={onKeyDown}
      tabIndex={0}
      className={
        "border rounded p-2 cursor-pointer " +
        "bg-background inline-flex items-center gap-2 text-center"
      }
      onClick={showSetter}
    >
      <>
        <span className="sm:hidden xl:block whitespace-nowrap">
          Edit shares
        </span>
        👪
      </>
    </div>
  );
}
