import { useAppDispatch } from "@/lib/hooks";
import { TParetoChartData } from "../pareto/chart";
import { rCombined } from "@/lib/reducers";
import { chart } from "@/lib/utils";

import LineTypeOption from "./typeSelector";

export default function ChartStyler(pp: { users: TParetoChartData["users"] }) {
  const dispatch = useAppDispatch();

  return (
    <div
      className={
        "absolute left-1/2 top-1/2 -translate-1/2 " +
        "border w-fit rounded p-2 flex flex-col gap-2 items-center justify-center"
      }
    >
      {pp.users.map(({ id, name, chartStyle }) => {
        const { color } = chart(chartStyle);

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
                onChange={(ev) => {
                  dispatch(
                    rCombined.setChartStyle(
                      `${chartStyle?.at(0) ?? "0"}${ev.target.value.slice(1)}`,
                      id
                    )
                  );
                }}
              />

              <LineTypeOption {...{ chartStyle, id, setTo: "solid" }} />
              <LineTypeOption {...{ chartStyle, id, setTo: "dashed" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
