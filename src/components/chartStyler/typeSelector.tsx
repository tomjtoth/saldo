import { useAppDispatch } from "@/lib/hooks";
import { chart, LineType } from "@/lib/utils";
import { rCombined } from "@/lib/reducers";

export default function LineTypeOption({
  chartStyle,
  id,
  setTo,
}: {
  chartStyle: string;
  id: number;
  setTo: LineType;
}) {
  const dispatch = useAppDispatch();

  const setToCode = setTo === "solid" ? 0 : 1;
  const { color, lineType } = chart(chartStyle ?? "");
  const checked = lineType === setTo;

  return (
    <label className="flex flex-col items-center cursor-pointer">
      <input
        type="radio"
        className="hidden"
        value={setToCode}
        checked={checked}
        onChange={(ev) => {
          if (ev.target.checked)
            dispatch(
              rCombined.setChartStyle(`${setToCode}${chartStyle.slice(1)}`, id)
            );
        }}
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
            borderBottom: `4px ${setTo} ${color}`,
          }}
        />
        <div className="w-12 h-4" />
      </div>
    </label>
  );
}
