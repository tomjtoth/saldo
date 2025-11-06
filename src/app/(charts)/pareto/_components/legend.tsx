import { DefaultLegendContentProps } from "recharts";

import LegendEntry from "@/app/(charts)/_components/legendEntry";

export default function ParetoLegend({ payload }: DefaultLegendContentProps) {
  return (
    <div className="flex gap-2 items-center justify-center">
      {payload?.map(({ color, value, dataKey }) => {
        return (
          <LegendEntry
            key={dataKey as number}
            id={dataKey as number}
            name={value as string}
            color={color as string}
            invisible
            setLabelColor
          />
        );
      })}
    </div>
  );
}
