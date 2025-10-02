"use client";

import { useContext } from "react";
import { TooltipContentProps } from "recharts";
import {
  NameType,
  ValueType,
} from "recharts/types/component/DefaultTooltipContent";
import { TooltipPayload } from "recharts/types/state/tooltipSlice";

import { chart, dateFromInt } from "@/lib/utils";
import { CtxBalanceChart } from "./chart";

export default function BalanceTooltip({
  payload,
  label,
  active,
}: TooltipContentProps<ValueType, NameType>) {
  const users = useContext(CtxBalanceChart);

  if (!active || !payload) return null;

  return (
    <div className="bg-background rounded border p-2">
      <h3>{dateFromInt(label as number)}</h3>

      {(payload as TooltipPayload).map((x) => {
        const uids = (x.dataKey as string).split(" vs ").map(Number);
        const [u1, u2] = users.filter((u) => uids.includes(u.id));

        const u1span = (
          <span style={{ color: chart(u1).color }}>{u1.name}</span>
        );

        const u2span = (
          <span style={{ color: chart(u2).color }}>{u2.name}</span>
        );

        const val = x.value as number;

        const title =
          val <= 0 ? (
            <>
              {u1span} owes {u2span}
            </>
          ) : (
            <>
              {u2span} owes {u1span}
            </>
          );

        return (
          <p key={x.name} style={{ color: x.color }} className="ml-2">
            {title}: {Math.abs(val).toFixed(2)}€
          </p>
        );
      })}
    </div>
  );
}
