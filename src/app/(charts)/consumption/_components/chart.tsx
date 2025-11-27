"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { useClientState } from "@/app/_lib/hooks";
import { ConsumptionCx } from "./context";

import ConsumptionTooltip from "./tooltip";
import ConsumptionLegend from "./legend";

export default function ConsumptionChart() {
  const group = useClientState("group");

  const buffer = useMemo(
    () =>
      Object.fromEntries(
        group?.categories.map(({ id, name }) => [id, name]) ?? []
      ),
    [group?.categories]
  );

  return (
    <ConsumptionCx.Provider value={buffer}>
      <div className=" h-full w-full">
        <ResponsiveContainer>
          <BarChart data={group?.consumption}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="categoryId"
              tickFormatter={(id) => buffer[id]}
              type="category"
              allowDuplicatedCategory={false}
              angle={-75}
              textAnchor="end"
              height={100}
            />
            <YAxis />
            <Tooltip content={ConsumptionTooltip} />
            <Legend content={ConsumptionLegend} />
            {group?.users.map(({ id, name, color }) => (
              <Bar
                dataKey={id}
                name={name!}
                key={id}
                stackId="a"
                fill={color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ConsumptionCx.Provider>
  );
}
