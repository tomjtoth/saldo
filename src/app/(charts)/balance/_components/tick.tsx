"use client";

import { XAxisTickContentProps } from "recharts";

import { VDate } from "@/app/_lib/utils";

export default function BalanceTick({ x, y, payload }: XAxisTickContentProps) {
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
