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

import { chart } from "@/lib/utils";

import ParetoTooltip from "./tooltip";

export type TParetoChartData = {
  users: { id: number; name: string; chartStyle: string }[];
  categories: ({
    category: string;
  } & {
    [user: string]: number;
  })[];
};

export default class ParetoChart extends PureComponent<
  TParetoChartData & {
    onLegendClick: () => void;
  },
  { users: TParetoChartData["users"] }
> {
  render() {
    const { users, categories } = this.props;

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
            <Legend onClick={this.props.onLegendClick} />
            {users.map(({ id, name, chartStyle }) => (
              <Bar
                dataKey={id}
                name={name}
                key={id}
                stackId="a"
                fill={chart(chartStyle).color}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
