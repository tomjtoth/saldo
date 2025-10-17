import { useContext } from "react";
import { DefaultLegendContentProps } from "recharts";

import { CtxBalanceChart } from "./chart";

import Entry from "@/components/charts/legendEntry";

export default function BalanceLegend(x: DefaultLegendContentProps) {
  const users = useContext(CtxBalanceChart);

  return (
    <div className="flex gap-2 items-center justify-center">
      {x.payload?.map(({ dataKey }) => {
        const uids = (dataKey as string).split(" vs ").map(Number);
        const [u1, u2] = users.filter((u) => uids.includes(u.id));

        return u1 && u2 ? (
          <div
            key={dataKey as string}
            className="px-2"
            style={{
              backgroundImage: `linear-gradient(
                  to right,
                  ${u1.color} 0%,
                  ${u1.color} 30%,
                  ${u2.color} 70%,
                  ${u2.color} 100%
                )`,
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              color: "transparent",
              WebkitTextFillColor: "transparent",
              display: "inline-block",
            }}
          >
            <Entry {...u1} invisible={true} /> vs{" "}
            <Entry {...u2} invisible={true} />
          </div>
        ) : null;
      })}
    </div>
  );
}
