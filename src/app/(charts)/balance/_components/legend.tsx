import { DefaultLegendContentProps } from "recharts";

import { useBalanceChartCx } from "./logic";

import LegendEntry from "@/app/(charts)/_components/legendEntry";

export default function BalanceLegend({ payload }: DefaultLegendContentProps) {
  const users = useBalanceChartCx();

  return (
    <div className="flex gap-2 items-center justify-center">
      {payload?.map(({ dataKey }) => {
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
            <LegendEntry {...u1} invisible /> vs{" "}
            <LegendEntry {...u2} invisible />
          </div>
        ) : null;
      })}
    </div>
  );
}
