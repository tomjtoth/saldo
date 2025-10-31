"use client";

import Canceler from "@/components/canceler";
import Options from ".";
import { useBodyNodes } from "@/components/bodyNodes";

export default function OptionsAsModal({ itemId }: { itemId: number }) {
  const nodes = useBodyNodes();

  return (
    <Canceler className="sm:hidden z-2" onClick={nodes.pop}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 " +
          "p-2 flex flex-wrap gap-2 justify-evenly"
        }
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) nodes.pop();
        }}
      >
        <Options {...{ itemId, hideModal: nodes.pop }} />
      </div>
    </Canceler>
  );
}
