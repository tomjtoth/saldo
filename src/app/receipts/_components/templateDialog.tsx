import { useLayoutEffect, useRef } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import Canceler from "@/app/_components/canceler";
import { vf } from "@/app/_lib/utils";

export default function ReceiptTemplateDialog() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const receipt = useClientState("group")!.activeReceipt!;
  const cancelRef = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    cancelRef.current?.focus();
  }, []);

  return (
    <Canceler>
      <div className="[&_p]:py-2 text-center">
        <h2 className="text-center">Toggling template state</h2>

        {vf(receipt).template ? (
          <p>
            Converting this template to a <b>receipt</b> will cause it along
            with all its items to be <b>included in balance and consumption</b>{" "}
            data.
          </p>
        ) : (
          <p>
            Converting this receipt to a <b>template</b> will remove it along
            with all its items to be{" "}
            <b>excluded from balance and consumption</b> data.
          </p>
        )}

        <p>Are you sure you want to continue?</p>

        <div className="flex gap-2 items-center justify-around [&_button]:py-1!">
          <button
            onClick={() => {
              nodes.pop();
              dispatch(thunks.toggleActiveReceiptTemplate());

              // TODO
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
