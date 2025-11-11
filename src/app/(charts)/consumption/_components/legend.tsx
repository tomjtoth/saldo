import { DefaultLegendContentProps } from "recharts";

import UserColorPicker from "@/app/_components/userColorPicker";

export default function ConsumptionLegend({
  payload,
}: DefaultLegendContentProps) {
  return (
    <div className="flex gap-2 items-center justify-center">
      {payload?.map(({ color, value, dataKey }) => {
        return (
          <UserColorPicker
            key={dataKey as number}
            id={dataKey as number}
            name={value as string}
            color={color as string}
            hideInput
            setLabelColor
          />
        );
      })}
    </div>
  );
}
