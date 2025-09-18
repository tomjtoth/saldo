import { useState } from "react";

import { appToast, LineType, sendJSON, virt } from "@/lib/utils";
import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";

export default function ChartLineConfig(pp: { statusId: number }) {
  const [flags, setFlags] = useState(pp.statusId);
  const dispatch = useAppDispatch();

  const si = { flags };

  const Slider = ({ color }: { color: "red" | "green" | "blue" }) => {
    const key = ({ red: "r", green: "g", blue: "b" } as const)[color];

    return (
      <div>
        <div className="flex flex-col items-center">
          <input
            type="range"
            min={0}
            max={3}
            step={1}
            value={virt(si).chart.color[key]}
            onChange={(e) =>
              (virt(si, setFlags).chart.color[key] = Number(e.target.value))
            }
            className={"w-40 accent-current " + color}
            style={{ color }}
          />

          {/* marks */}
          <div className="flex justify-between w-40 mt-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-1 h-2 bg-gray-600 rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  const TypeSelector = ({ type }: { type: LineType }) => {
    const checked = virt(si).chart.lineType === type;
    const color = virt(si).chart.color.rgba(checked ? 1 : 0.4);

    return (
      <label className="flex flex-col items-center cursor-pointer">
        <input
          type="radio"
          value={type}
          checked={checked}
          onChange={() => (virt(si, setFlags).chart.lineType = type)}
          className="hidden"
        />

        <div
          className="px-6 rounded-full"
          style={
            checked
              ? {
                  boxShadow: `0 0 20px 5px ${color},
                        inset 0 0 20px 5px ${color}`,
                }
              : undefined
          }
        >
          <div
            className="w-12 h-5"
            style={{
              borderBottom: `4px ${type} ${color}`,
            }}
          />
          <div className="w-12 h-4" />
        </div>
      </label>
    );
  };

  const Config = () => (
    <div className="flex flex-col gap-6 items-center">
      <div className="flex flex-col gap-6">
        <Slider color="red" />
        <Slider color="green" />
        <Slider color="blue" />
      </div>

      <div className="flex gap-6 mb-2">
        <TypeSelector type="solid" />
        <TypeSelector type="dashed" />
      </div>
    </div>
  );

              dispatch(rCombined.setUserFlags(statusId));
  );
}
