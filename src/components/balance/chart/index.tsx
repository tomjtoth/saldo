"use client";

import React, { PureComponent } from "react";
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

export default class BalanceChart extends PureComponent<TBalanceChartData> {
  render() {
    const { data, relations } = this.props;

    return (
      <div className=" h-full w-full">
        <ResponsiveContainer>
          <LineChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              type="number"
              height={100}
              tick={BalanceTick}
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
}
