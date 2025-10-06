import { useAppDispatch, useDebounce } from "@/lib/hooks";
import { rCombined } from "@/lib/reducers";
import { TUserChartData } from "@/lib/db";

export default function Entry({
  id,
  name,
  color,
  invisible = false,
}: TUserChartData & { invisible?: boolean }) {
  const dispatch = useAppDispatch();

  const debouncedSetter = useDebounce(
    (color: string) => dispatch(rCombined.setUserColor(color, id)),
    500
  );

  return (
    <label>
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
