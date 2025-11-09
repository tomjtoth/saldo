import { useAppDispatch, useDebounce } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { TUserChartData } from "@/app/_lib/db";

export default function UserColorPicker({
  id,
  name,
  color,
  hideInput,
  setLabelColor,
  canReset,
}: TUserChartData & {
  hideInput?: true;
  setLabelColor?: true;
  canReset?: true;
}) {
  const dispatch = useAppDispatch();

  const debouncedSetter = useDebounce(
    (color: string) => dispatch(thunks.setUserColor(color, id)),
    500
  );

  return (
    <>
      <label style={setLabelColor ? { color } : undefined}>
        <input
          type="color"
          className={
            "border-0! align-middle " +
            (hideInput ? "w-0 px-px! invisible" : "w-8")
          }
          value={color}
          onChange={(ev) => debouncedSetter(ev.target.value)}
        />
        {name}
      </label>
      {canReset && (
        <span
          className="cursor-pointer ml-2"
          onClick={() => dispatch(thunks.setUserColor(null, id))}
        >
          🔄{" "}
          <span className="hidden md:inline-block">Reset to their default</span>
        </span>
      )}
    </>
  );
}
