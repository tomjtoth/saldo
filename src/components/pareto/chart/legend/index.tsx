import { DefaultLegendContentProps } from "recharts";
import Entry from "./entry";

export default function ParetoLegend(x: DefaultLegendContentProps) {
  return (
    <div className="flex gap-2 items-center justify-center">
      {x.payload?.map(({ color, value, dataKey }) => {
        return (
          <Entry
            id={dataKey as number}
            name={value as string}
            chartStyle={color as string}
          />
        );
      })}
    </div>
  );
}
