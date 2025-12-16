import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { virt } from "@/app/_lib/utils";

import Canceler from "@/app/_components/canceler";
import Slider from "@/app/_components/slider";

export default function ConsumptionSettings() {
  const nodes = useBodyNodes();
  const group = useClientState("group")!;
  const user = useClientState("user")!;
  const dispatch = useAppDispatch();

  return (
    <Canceler onClick={nodes.pop}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 p-2 " +
          "max-h-4/5 max-w-4/5 overflow-scroll bg-background border rounded"
        }
      >
        <p className="text-center">Visibility of categories</p>
        <hr />
        <ul
          className={
            "sm:columns-2 sm:gap-2 " +
            "lg:columns-4 lg:gap-4 " +
            "2xl:columns-6 2xl:gap-6"
          }
        >
          {group.categories.map((c) =>
            !virt(c).active ? null : (
              <li key={c.id}>
                <Slider
                  className="p-2 cursor-pointer"
                  checked={!user.categoriesHiddenFromConsumption.includes(c.id)}
                  onClick={() =>
                    dispatch(thunks.toggleCategoryVisibility(c.id))
                  }
                >
                  {c.name}
                </Slider>
              </li>
            )
          )}
        </ul>
      </div>
    </Canceler>
  );
}
