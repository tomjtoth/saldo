"use client";

import React, { PureComponent } from "react";
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

import ParetoTooltip from "./tooltip";

export type TParetoChartData = {
  names: string[];
  categories: ({
    category: string;
    __sum: number;
  } & {
    [user: string]: number;
  })[];
};

export default class ParetoChart extends PureComponent<TParetoChartData> {
  render() {
    const { names, categories } = this.props;

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
            <Legend />
            {names.map((s) => (
              <Bar
                dataKey={s}
                name={s}
                key={s}
                stackId="a"
                fill={`#${Math.floor(Math.random() * 0xfff)
                  .toString(16)
                  .padStart(3, "0")}`}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
