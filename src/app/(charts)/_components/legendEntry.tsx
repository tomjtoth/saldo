import { useAppDispatch, useDebounce } from "@/app/_lib/hooks";
import { rCombined } from "@/app/_lib/reducers";
import { TUserChartData } from "@/app/_lib/db";

export default function LegendEntry({
  id,
  name,
  color,
  invisible = false,
  setLabelColor = false,
}: TUserChartData & { invisible?: boolean; setLabelColor?: boolean }) {
  const dispatch = useAppDispatch();

  const debouncedSetter = useDebounce(
    (color: string) => dispatch(rCombined.setUserColor(color, id)),
    500
  );

  return (
    <label style={setLabelColor ? { color } : undefined}>
      <input
        type="color"
        className={"border-0! " + (invisible ? "w-0 px-px! invisible" : "w-8")}
        value={color}
        onChange={(ev) => debouncedSetter(ev.target.value)}
      />

      {name}
    </label>
  );
}
