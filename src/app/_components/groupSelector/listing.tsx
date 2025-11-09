import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import ViewListing from "../viewSelector/listing";

export default function GroupListing() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const cs = useClientState();

  return cs.groups.length ? (
    <ul className="p-2">
      {cs.groups.map((group) => {
        const checked = group.id === cs.groupId;

        return (
          <li key={group.id}>
            <label className="text-xl cursor-pointer">
              <input
                type="radio"
                radioGroup="a"
                className="mr-2 cursor-pointer"
                checked={checked}
                onChange={() => {
                  dispatch(thunks.setGroupId(group.id!));
                  nodes.pop();
                }}
              />
              {group.name}
            </label>

            <ViewListing
              decorate
              prefix={checked ? "" : `/groups/${group.id}`}
            />
          </li>
        );
      })}
    </ul>
  ) : (
    <div className="p-2">
      Go to
      <ViewListing decorate />
    </div>
  );
}
