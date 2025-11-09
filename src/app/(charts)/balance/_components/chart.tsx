"use client";

import { ReactNode, useEffect } from "react";
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

import { TBalanceChartData } from "@/app/_lib/db";

import { useBalanceChartCx } from "../_lib/hook";

import BalanceTick from "./tick";
import BalanceTooltip from "./tooltip";
import BalanceLegend from "./legend";

export default function BalanceChart({
  data,
  relations,
  users,
}: TBalanceChartData) {
  const cx = useBalanceChartCx()!;

  const gradientDefinitions: ReactNode[] = [];

  const lines = relations?.map((rel) => {
    const uids = rel.split(" vs ").map(Number);
    const [u1, u2] = users.filter((u) => uids.includes(u.id!));

    const defId = `${u1.id}-${u2.id}-chart-colors`;

    const { min, max } = cx.hook!.findMinMax();

    const abs = [min, max].map(Math.abs);
    const height = abs[0] + abs[1];

    const switchAt =
      max <= 0 ? 100 : min >= 0 ? 0 : ((abs[1] * 100) / height).toFixed(1);

    gradientDefinitions.push(
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
        data={data}
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

  useEffect(() => {
    console.debug("lines got re-rendered (?)");
  }, [lines]);

  return (
    <div className="h-full w-full">
      <ResponsiveContainer>
        <LineChart
          className="select-none"
          onMouseDown={cx.hook!.startHighlight}
          onMouseMove={cx.hook!.dragHighlight}
          onMouseUp={cx.hook!.zoomIn}
          onMouseLeave={cx.hook!.cancelHighlight}
          onDoubleClick={cx.hook!.zoomOut}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            type="number"
            height={100}
            tick={BalanceTick}
            padding={{ left: 10, right: 10 }}
            allowDataOverflow
            domain={[cx.hook!.state.left, cx.hook!.state.right]}
          />
          <YAxis
            allowDataOverflow
            domain={[cx.hook!.state.bottom, cx.hook!.state.top]}
            tickFormatter={(v) => v.toFixed(2)}
            padding={{ bottom: 10, top: 10 }}
          />
          <Tooltip content={BalanceTooltip} />
          <Legend content={BalanceLegend} />

          <defs>{gradientDefinitions}</defs>
          <ReferenceLine
            y={0}
            offset={10}
            strokeWidth={2}
            strokeDasharray="10 5"
          >
            <Label value="0.00" position="left" fontWeight="bold" />
          </ReferenceLine>
          {lines}

          {cx.hook?.state.refAreaLeft !== undefined &&
          cx.hook?.state.refAreaRight !== undefined ? (
            <ReferenceArea
              x1={cx.hook?.state.refAreaLeft}
              x2={cx.hook?.state.refAreaRight}
              strokeOpacity={0.3}
            />
          ) : null}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
