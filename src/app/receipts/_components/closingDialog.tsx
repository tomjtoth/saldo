import pluralize from "pluralize";
import { useLayoutEffect, useRef } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import Canceler from "@/app/_components/canceler";

export default function ReceiptClosingDialog() {
  const nodes = useBodyNodes();
  const receipt = useClientState("group")!.activeReceipt!;
  const dispatch = useAppDispatch();

  const cancelRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <Canceler onClick={nodes.pop}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 p-2 bg-background " +
          "border rounded"
        }
      >
        <h2 className="text-center">Closing receipt</h2>
        <p className="py-2">
          {receipt.changes} unsaved {pluralize("change", receipt.changes)} will
          be lost..
        </p>
        <div className="flex gap-2 items-center justify-around [&_button]:py-1!">
          <button
            onClick={() => {
              nodes.setNodes([]);
              dispatch(thunks.setActiveReceipt());
            }}
          >
            OK
          </button>
          <button onClick={nodes.pop} ref={cancelRef}>
            Cancel
          </button>
        </div>
      </div>
    </Canceler>
  );
}
