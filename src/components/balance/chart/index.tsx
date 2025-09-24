"use client";

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
import BalanceTick from "./tick";
import BalanceTooltip from "./tooltip";

export type TBalanceChartData = {
  relations: string[];
  data: {
    date: number;
    [key: string]: number;
  }[];
};

export default function BalanceChart({ data, relations }: TBalanceChartData) {
  return (
    <div className="h-full w-full">
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
          {relations.map((s) => (
            <Line
              dataKey={s}
              data={data}
              name={s}
              key={s}
              connectNulls
              stroke={`#${Math.floor(Math.random() * 0xfff)
                .toString(16)
                .padStart(3, "0")}`}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
