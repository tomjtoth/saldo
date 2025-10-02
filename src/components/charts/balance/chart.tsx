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
} from "recharts";

import { chart } from "@/lib/utils";
import { TBalanceChartData, TUserChartData } from "@/lib/db";

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
  const gradientDefinitions: ReactNode[] = [];

  const lines = relations.map((rel) => {
    const uids = rel.split(" vs ").map(Number);
    const [u1, u2] = users.filter((u) => uids.includes(u.id));

    const defId = `${u1.id}-${u2.id}-chart-colors`;

    const { min, max } = data.reduce(
      (prev, curr) => {
        const val = curr[rel];
        if (val > prev.max) prev.max = val;
        if (val < prev.min) prev.min = val;

        return prev;
      },
      { min: Number.POSITIVE_INFINITY, max: Number.NEGATIVE_INFINITY }
    );

    const center = (max - min) / 2;
    const switchAt = max <= 0 ? 100 : min >= 0 ? 0 : 100 * (center / 2 / max);

    gradientDefinitions.push(
      <linearGradient key={defId} id={defId} x1="0" y1="0" x2="0" y2="1">
        <stop offset={`${switchAt}%`} stopColor={chart(u1).color} />
        <stop offset={`${switchAt}%`} stopColor={chart(u2).color} />
      </linearGradient>
    );

    return (
      <Line
        key={rel}
        dataKey={rel}
        data={data}
        connectNulls
        name={[u1.name, u2.name].toSorted().join(" vs ")}
        stroke={`url(#${defId})`}
      />
    );
  });

  const initialState: {
    refAreaLeft?: string | number;
    refAreaRight?: string | number;
    left: string | number;
    right: string | number;
    bottom: string | number;
    top: string | number;
  } = {
    left: "dataMin",
    right: "dataMax",
    top: "dataMax+1.1*dataMax",
    bottom: "dataMin-1.1*dataMin",
  };

  const [state, setState] = useState(initialState);

  useEffect(() => {
    console.debug("lines got re-rendered (?)");
  }, [lines]);

  function zoom() {
    let { refAreaLeft, refAreaRight } = state;

    if (refAreaLeft === refAreaRight || refAreaRight === undefined) {
      setState((prevState) => ({
        ...prevState,
        refAreaLeft: undefined,
        refAreaRight: undefined,
      }));
      return;
    }

    if (refAreaLeft! > refAreaRight)
      [refAreaLeft, refAreaRight] = [refAreaRight, refAreaLeft];

    let [bottom, top] = data.reduce(
      (prev, curr) => {
        if (
          curr.date >= (refAreaLeft as number)! &&
          curr.date <= (refAreaRight as number)!
        ) {
          if (curr.min < prev[0]) prev[0] = curr.min;
          if (curr.max > prev[1]) prev[1] = curr.max;
        }

        return prev;
      },
      [data[0].min, data[0].max]
    );

    bottom *= 1.5;
    top *= 1.5;

    setState({
      bottom,
      top,
      left: refAreaLeft!,
      right: refAreaRight!,
      refAreaLeft: undefined,
      refAreaRight: undefined,
    });
  }

  const zoomOut = () => setState(initialState);

  const { refAreaLeft, refAreaRight, left, right, bottom, top } = state;

  return (
    <CtxBalanceChart.Provider value={users}>
      <div className="flex flex-wrap gap-2 items-center justify-center">
        <label>
          group: <GroupSelector />
        </label>
        {(left !== initialState.left || right !== initialState.right) && (
          <button onClick={zoomOut}>zoom out</button>
        )}
      </div>

      <div className="h-full w-full">
        <ResponsiveContainer>
          <LineChart
            onMouseDown={(e) =>
              setState({ ...state, refAreaLeft: e.activeLabel })
            }
            onMouseMove={({ activeLabel: lbl }) => {
              if (
                state.refAreaLeft !== undefined &&
                (state.refAreaRight === undefined || state.refAreaRight !== lbl)
              ) {
                setState({ ...state, refAreaRight: lbl });
              }
            }}
            onMouseUp={zoom}
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
            <YAxis allowDataOverflow domain={[bottom, top]} />
            <Tooltip content={BalanceTooltip} />
            <Legend content={BalanceLegend} />

            <defs>{gradientDefinitions}</defs>
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
