import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import ViewListing from "../viewSelector/listing";

export default function GroupListing() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const cs = useClientState();

  return (
    <ul className="text-xl p-2">
      {cs.groups.map((group) => {
        const checked = group.id === cs.groupId;

        return (
          <li key={group.id}>
            <label className="cursor-pointer">
              <input
                type="radio"
                radioGroup="a"
                className="mr-2"
                checked={checked}
                onChange={() => {
                  dispatch(thunks.setGroupId(group.id!));
                  nodes.pop();
                }}
              />
              {group.name}
            </label>

            <ViewListing prefix={checked ? "" : `/groups/${group.id}`} />
          </li>
        );
      })}
    </ul>
  );
}
