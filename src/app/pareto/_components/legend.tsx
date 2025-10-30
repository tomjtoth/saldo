import { DefaultLegendContentProps } from "recharts";
import Entry from "@/app/(charts)/_components/legendEntry";

export default function ParetoLegend(x: DefaultLegendContentProps) {
  return (
    <div className="flex gap-2 items-center justify-center">
      {x.payload?.map(({ color, value, dataKey }) => {
        return (
          <Entry
            key={dataKey as number}
            id={dataKey as number}
            name={value as string}
            color={color as string}
          />
        );
      })}
    </div>
  );
}
