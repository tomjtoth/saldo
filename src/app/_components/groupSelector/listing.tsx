import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import ViewListing from "../viewSelector/listing";

export default function GroupListing() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const nodes = useBodyNodes();
  const groups = useClientState("groups");
  const groupId = useClientState("groupId");

  const [showAll, setShowAll] = useState(false);

  const groupLink = (
    <span className="block mb-2 whitespace-nowrap">
      👨‍👨‍👦‍👦 <Link href="/groups">group settings</Link>
    </span>
  );

  return groups.length && pathname !== "/groups" ? (
    <div className="p-2">
      <label>
        <input
          type="checkbox"
          className="mr-2"
          checked={showAll}
          onChange={() => setShowAll(!showAll)}
        />
        permalinks
      </label>
      {pathname !== "/groups" && groupLink}
      <ul>
        {groups.map((group) => {
          const checked = group.id === groupId;

          // TODO: get `truncate` to work with the below label
          return (
            <li key={group.id}>
              <hr />

              <label className="text-xl">
                <input
                  type="radio"
                  name="group-selection"
                  className="mr-2"
                  checked={checked}
                  onChange={() => {
                    dispatch(thunks.setGroupId(group.id));
                    nodes.pop();
                  }}
                />
                {group.name}
              </label>

              {(showAll || checked) && (
                <ViewListing
                  decorate
                  prefix={showAll ? `/groups/${group.id}` : ""}
                  includeCurrentPath={showAll}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  ) : (
    <div className="p-2">
      {pathname === "/groups" ? "Go to" : groupLink}
      <ViewListing decorate />
    </div>
  );
}
