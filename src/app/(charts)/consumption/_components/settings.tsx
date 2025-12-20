import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { vf } from "@/app/_lib/utils";

import Canceler from "@/app/_components/canceler";
import Slider from "@/app/_components/slider";

export default function ConsumptionSettings() {
  const group = useClientState("group")!;
  const user = useClientState("user")!;
  const dispatch = useAppDispatch();

  return (
    <Canceler>
      <div className="overflow-scroll">
        <p className="text-center">Visibility of categories</p>
        <hr />
        <ul
          className={
            "sm:columns-2 sm:gap-2 " +
            "lg:columns-4 lg:gap-4 " +
            "2xl:columns-6 2xl:gap-6"
          }
        >
          {group.categories.filter(vf.active).map((c) => (
            <li key={c.id}>
              <Slider
                className="p-2 cursor-pointer"
                checked={!user.categoriesHiddenFromConsumption.includes(c.id)}
                onClick={() => dispatch(thunks.toggleCategoryVisibility(c.id))}
              >
                {c.name}
              </Slider>
            </li>
          ))}
        </ul>
      </div>
    </Canceler>
  );
}
