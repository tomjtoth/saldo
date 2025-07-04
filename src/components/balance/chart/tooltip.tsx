"use client";

import { TooltipContentProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { TooltipPayload } from "recharts/types/state/tooltipSlice";

import { dateFromInt } from "@/lib/utils";

export default function BalanceTooltip({
  payload,
  label,
  active,
}: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || !label) return null;

  return (
    <div className="bg-background rounded border p-2">
      <h3>{dateFromInt(label as number)}</h3>

      {(payload as TooltipPayload).map((x) => (
        <p key={x.name} style={{ color: x.color }} className="ml-2">
          {x.name}: {(x.value as number).toFixed(2)}
        </p>
      ))}
    </div>
  );
}
