"use client";

import { TooltipContentProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { TooltipPayload } from "recharts/types/state/tooltipSlice";

import { useConsumptionCx } from "./context";

export default function ConsumptionTooltip({
  payload,
  label: catId,
  active,
}: TooltipContentProps<ValueType, NameType>) {
  const cx = useConsumptionCx();

  if (!active || !payload || !catId) return null;

  return (
    <div className="bg-background rounded border p-2">
      <h3>{cx[catId as number]}</h3>

      {(payload as TooltipPayload)
        .toSorted(({ name: a }, { name: b }) => {
          a = (a as string).toLowerCase();
          b = (b as string).toLowerCase();

          return a < b ? -1 : a > b ? 1 : 0;
        })
        .map((x) => (
          <p key={x.name} style={{ color: x.color }} className="ml-2">
            {x.name}: {(x.value as number).toFixed(2)}
          </p>
        ))}
    </div>
  );
}
