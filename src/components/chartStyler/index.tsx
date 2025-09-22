import { useAppDispatch, useDebounce } from "@/lib/hooks";
import { TParetoChartData } from "../pareto/chart";
import { rCombined } from "@/lib/reducers";
import { chart } from "@/lib/utils";

import LineTypeOption from "./typeSelector";
import { useState } from "react";

export default function ChartStyler(pp: { users: TParetoChartData["users"] }) {
  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "border w-fit rounded p-2 flex flex-col gap-2 items-center justify-center"
      }
    >
      {pp.users.map((user) => (
        <Child key={user.id} {...user} />
      ))}
    </div>
  );
}

const Child = ({ id, name, chartStyle }: TParetoChartData["users"]["0"]) => {
  const dispatch = useAppDispatch();
  const [color, setColor] = useState(chart(chartStyle).color);

  useDebounce(
    () =>
      dispatch(
        rCombined.setChartStyle(
          `${chartStyle?.at(0) ?? "0"}${color.slice(1)}`,
          id
        )
      ),
    [color]
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
          onChange={(ev) => setColor(ev.target.value)}
        />

        <LineTypeOption {...{ chartStyle, id, setTo: "solid" }} />
        <LineTypeOption {...{ chartStyle, id, setTo: "dashed" }} />
      </div>
    </div>
  );
};
