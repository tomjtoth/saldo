import { useAppDispatch, useDebounce } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";
import { chart } from "@/lib/utils";
import { TUserChartData } from "@/lib/db";

import LineTypeOption from "./typeSelector";

export default function Entry({ id, name, chartStyle }: TUserChartData) {
  const dispatch = useAppDispatch();
  const { color } = chart(chartStyle);

  const debouncedSetter = useDebounce(
    (color: string) =>
      dispatch(
        rCombined.setChartStyle(
          `${chartStyle?.at(0) ?? "0"}${color.slice(1)}`,
          id
        )
      ),
    500
  );

  return (
    <div
      key={id}
      className="flex flex-col gap-2 items-center"
      style={{ color }}
    >
      {name}

      <div className="flex p-2 gap-2 justify-between">
        <input
          type="color"
          className="border-0! cursor-pointer"
          value={color}
          onChange={(ev) => debouncedSetter(ev.target.value)}
        />

        <LineTypeOption {...{ chartStyle, id, setTo: "solid" }} />
        <LineTypeOption {...{ chartStyle, id, setTo: "dashed" }} />
      </div>
    </div>
  );
}
