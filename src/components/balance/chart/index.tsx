"use client";

import { createContext, ReactNode, useContext, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { chart } from "@/lib/utils";
import { TBalanceChartData, TUserChartData } from "@/lib/db";

import BalanceTick from "./tick";
import BalanceTooltip from "./tooltip";

const CtxUsers = createContext<TUserChartData[]>([]);

export const useChartUsersData = () => useContext(CtxUsers);

export default function BalanceChart({
  data,
  relations,
  users,
}: TBalanceChartData) {
  const defs: ReactNode[] = [];

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

    defs.push(
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

  useEffect(() => {
    console.debug("lines got re-rendered (?)");
  }, [lines]);

  return (
    <CtxUsers.Provider value={users}>
      <div
        className="h-full w-full"
        onWheel={(ev) => {
          ev.target;
        }}
      >
        <ResponsiveContainer>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="number"
              height={100}
              tick={BalanceTick}
              padding={{ left: 10, right: 10 }}
              domain={[data.at(0)!.date, data.at(-1)!.date]}
            />
            <YAxis />
            <Tooltip content={BalanceTooltip} />
            <Legend />

            <defs>{defs}</defs>
            {lines}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CtxUsers.Provider>
  );
}
