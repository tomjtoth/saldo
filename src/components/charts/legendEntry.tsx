import { useAppDispatch, useDebounce } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";
import { virt } from "@/lib/utils";
import { TUserChartData } from "@/lib/db";

export default function Entry({
  id,
  name,
  chartStyle,
  invisible = false,
}: TUserChartData & { invisible?: boolean }) {
  const dispatch = useAppDispatch();
  const { color } = virt({ chartStyle });

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
    <label style={{ color }}>
      <input
        type="color"
        className={
          "border-0! " + (invisible ? "w-0 px-[1px]! invisible" : "w-8")
        }
        value={color}
        onChange={(ev) => debouncedSetter(ev.target.value)}
      />

      {name}
    </label>
  );
}
