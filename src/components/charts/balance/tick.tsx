"use client";

import { TickItemTextProps } from "recharts/types/polar/PolarAngleAxis";

import { VDate } from "@/lib/utils";

export default function BalanceTick({ x, y, payload }: TickItemTextProps) {
  return (
    <text
      x={x}
      y={y}
      fill="#666"
      textAnchor="end"
      dy={-6}
      transform={`rotate(-75, ${x}, ${y})`}
    >
      {VDate.toStr(payload.value)}
    </text>
  );
}
