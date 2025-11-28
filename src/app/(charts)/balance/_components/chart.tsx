"use client";

import { ReactNode, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceArea,
  ReferenceLine,
  Label,
} from "recharts";

import { useAppSelector, useClientState } from "@/app/_lib/hooks";
import { findMinMax, useBalanceChartCx } from "../_lib/hook";
import { useDebugger } from "@/app/_lib/utils/react";

import BalanceTick from "./tick";
import BalanceTooltip from "./tooltip";
import BalanceLegend from "./legend";

export default function BalanceChart() {
  const balance = useAppSelector((s) => s.combined.group!.balance);
  const hook = useBalanceChartCx()!;
  const users = useClientState("users");

  const { lines, gradients } = useMemo(() => {
    const gradients: ReactNode[] = [];
    const lines = balance.relations.map((rel) => {
      const uids = rel.split(" vs ").map(Number);
      const [u1, u2] = users.filter((u) => uids.includes(u.id));

      const defId = `${u1.id}-${u2.id}-chart-colors`;

      const { min, max } = findMinMax(balance);

      const abs = [min, max].map(Math.abs);
      const height = abs[0] + abs[1];

      const switchAt =
        max <= 0 ? 100 : min >= 0 ? 0 : ((abs[1] * 100) / height).toFixed(1);

      gradients.push(
        <linearGradient key={defId} id={defId} x1="0" y1="0" x2="0" y2="1">
          <stop offset={`${switchAt}%`} stopColor={u2.color} />
          <stop offset={`${switchAt}%`} stopColor={u1.color} />
        </linearGradient>
      );

      return (
        <Line
          type="stepAfter"
          key={rel}
          dataKey={rel}
          data={balance.data}
          dot={false}
          connectNulls
          activeDot={({ cx, cy, value }) => (
            <circle
              cx={cx}
              cy={cy}
              r={4}
              strokeWidth={2}
              fill={value > 0 ? u2.color : u1.color}
            />
          )}
          name={[u1.name, u2.name].toSorted().join(" vs ")}
          stroke={`url(#${defId})`}
        />
      );
    });

    return { gradients, lines };
  }, [users, balance]);

  useDebugger("balance chart rerendered", gradients, lines);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <LineChart
          className="select-none"
          onMouseDown={hook.startHighlight}
          onMouseMove={hook.dragHighlight}
          onMouseUp={hook.zoomIn}
          onMouseLeave={hook.cancelHighlight}
          onDoubleClick={hook.zoomOut}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            type="number"
            height={100}
            tick={BalanceTick}
            padding={{ left: 10, right: 10 }}
            allowDataOverflow
            domain={[hook.state.left, hook.state.right]}
          />
          <YAxis
            allowDataOverflow
            domain={[hook.state.bottom, hook.state.top]}
            tickFormatter={(v) => v.toFixed(2)}
            padding={{ bottom: 10, top: 10 }}
          />
          <Tooltip content={BalanceTooltip} />
          <Legend content={BalanceLegend} />

          <defs>{gradients}</defs>
          <ReferenceLine
            y={0}
            offset={10}
            strokeWidth={2}
            strokeDasharray="10 5"
          >
            <Label value="0.00" position="left" fontWeight="bold" />
          </ReferenceLine>
          {lines}

          {hook.state.refAreaLeft !== undefined &&
          hook.state.refAreaRight !== undefined ? (
            <ReferenceArea
              x1={hook.state.refAreaLeft}
              x2={hook.state.refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
