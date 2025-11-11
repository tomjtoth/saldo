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

import { TConsumptionChartData } from "@/app/_lib/db";

import ConsumptionTooltip from "./tooltip";
import ConsumptionLegend from "./legend";

export default function ConsumptionChart({
  users,
  categories,
}: TConsumptionChartData) {
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
          <Tooltip content={ConsumptionTooltip} />
          <Legend content={ConsumptionLegend} />
          {users.map(({ id, name, color }) => (
            <Bar dataKey={id} name={name!} key={id} stackId="a" fill={color} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
