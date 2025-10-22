"use client";

import { createContext, ReactNode, useEffect, useState } from "react";
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

import { TBalanceChartData, TUserChartData } from "@/lib/db";

import useLogic from "./logic";
import BalanceTick from "./tick";
import BalanceTooltip from "./tooltip";
import BalanceLegend from "./legend";
import GroupSelector from "@/components/groups/selector";

export const CtxBalanceChart = createContext<TUserChartData[]>([]);

export default function BalanceChart({
  data,
  relations,
  users,
}: TBalanceChartData) {
  const {
    state: { refAreaLeft, refAreaRight, left, right, bottom, top },
    zoomIn,
    zoomOut,
    isZoomedIn,
    startHighlight,
    dragHighlight,
    findMinMax,
    cancelHighlight,
  } = useLogic(data);

  const gradientDefinitions: ReactNode[] = [];

  const lines = relations?.map((rel) => {
    const uids = rel.split(" vs ").map(Number);
    const [u1, u2] = users.filter((u) => uids.includes(u.id));

    const defId = `${u1.id}-${u2.id}-chart-colors`;

    const { min, max } = findMinMax();

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
        name={[u1.name, u2.name].toSorted().join(" vs ")}
        stroke={`url(#${defId})`}
      />
    );
  });

  useEffect(() => {
    console.debug("lines got re-rendered (?)");
  }, [lines]);

  return (
    <CtxBalanceChart.Provider value={users}>
      <div className="flex flex-wrap gap-2 items-center justify-center">
        <label>
          group: <GroupSelector />
        </label>
        {isZoomedIn() && <button onClick={zoomOut}>zoom out</button>}
      </div>

      <div className="h-full w-full">
        <ResponsiveContainer>
          <LineChart
            className="select-none"
            onMouseDown={startHighlight}
            onMouseMove={dragHighlight}
            onMouseUp={zoomIn}
            onMouseLeave={cancelHighlight}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="number"
              height={100}
              tick={BalanceTick}
              padding={{ left: 10, right: 10 }}
              allowDataOverflow
              domain={[left, right]}
            />
            <YAxis
              allowDataOverflow
              domain={[bottom, top]}
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

            {refAreaLeft !== undefined && refAreaRight !== undefined ? (
              <ReferenceArea
                x1={refAreaLeft}
                x2={refAreaRight}
                strokeOpacity={0.3}
              />
            ) : null}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CtxBalanceChart.Provider>
  );
}
