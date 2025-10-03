"use client";

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

import { virt } from "@/lib/utils";
import { TParetoChartData } from "@/lib/db";

import ParetoTooltip from "./tooltip";
import ParetoLegend from "./legend";

export default function ParetoChart({ users, categories }: TParetoChartData) {
  return (
    <div className=" h-full w-full">
      <ResponsiveContainer>
        <BarChart data={categories}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="category"
            type="category"
            allowDuplicatedCategory={false}
            angle={-75}
            textAnchor="end"
            height={100}
          />
          <YAxis />
          <Tooltip content={ParetoTooltip} />
          <Legend content={ParetoLegend} />
          {users.map(({ id, name, chartStyle }) => (
            <Bar
              dataKey={id}
              name={name}
              key={id}
              stackId="a"
              fill={virt({ chartStyle }).color}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
