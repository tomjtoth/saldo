import { useContext } from "react";
import { DefaultLegendContentProps } from "recharts";

import { CtxBalanceChart } from "./chart";

import Entry from "@/components/charts/legendEntry";

export default function BalanceLegend(x: DefaultLegendContentProps) {
  const users = useContext(CtxBalanceChart);

  return (
    <div className="flex gap-2 items-center justify-center">
      {x.payload?.map(({ color, dataKey }) => {
        const uids = (dataKey as string).split(" vs ").map(Number);
        const [u1, u2] = users.filter((u) => uids.includes(u.id));

        return (
          <div
            key={dataKey as string}
            className="rounded border px-2"
            style={{ borderColor: color }}
          >
            <Entry {...u1} invisible={true} /> vs{" "}
            <Entry {...u2} invisible={true} />
          </div>
        );
      })}
    </div>
  );
}
