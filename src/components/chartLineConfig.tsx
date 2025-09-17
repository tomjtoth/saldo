import { useState } from "react";

import { appToast, LineType, sendJSON, status } from "@/lib/utils";
import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";

export default function ChartLineConfig() {
  const rs = useGroupSelector();
  const [statusId, setStatusId] = useState(rs.user?.statusId ?? 0);
  const [showConfig, setShowConfig] = useState(false);
  const dispatch = useAppDispatch();

  const si = { statusId };

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
            value={status(si).chart.color[key]}
            onChange={(e) =>
              (status(si, setStatusId).chart.color[key] = Number(
                e.target.value
              ))
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
    const checked = status(si).chart.lineType === type;
    const color = status(si).chart.color.rgba(checked ? 1 : 0.4);

    return (
      <label className="flex flex-col items-center cursor-pointer">
        <input
          type="radio"
          value={type}
          checked={checked}
          onChange={() => (status(si, setStatusId).chart.lineType = type)}
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

  return !rs.user ? null : (
    <>
      <div
        onClick={() => {
          if (showConfig && statusId !== rs.user?.statusId) {
            appToast.promise(
              sendJSON(
                "/api/users",
                { id: rs.user!.id, statusId },
                { method: "PUT" }
              ).then(async (res) => {
                const { statusId } = await res.json();
                dispatch(rCombined.setUserStatusId(statusId));
              }),
              "updating Chart config"
            );
          }
          setShowConfig(!showConfig);
        }}
        className="cursor-pointer select-none p-2 text-center"
      >
        {showConfig ? "Close to save config" : "Show chart config"}{" "}
        <div className="inline-block">
          <div
            className={
              (showConfig ? "rotate-90" : "-rotate-90") +
              " transition duration-150"
            }
          >
            &lt;
          </div>
        </div>
      </div>
      {showConfig ? <Config /> : null}
    </>
  );
}
