import { useState } from "react";

import {
  useAppDispatch,
  useBodyNodes,
  useGroupSelector,
} from "@/app/_lib/hooks";
import { rCombined as red } from "@/app/_lib/reducers";

import ViewSelectorListing from "../viewSelector/listing";
import Canceler from "../canceler";

export default function GroupSelectorListing() {
  const dispatch = useAppDispatch();
  const nodes = useBodyNodes();
  const rs = useGroupSelector();
  const [collapsibles, setCollapsibles] = useState<{
    [groupId: number]: boolean;
  }>({});

  return (
    <Canceler onClick={nodes.pop}>
      <ul className="absolute left-1/2 top-1/2 -translate-1/2 p-2 bg-background border rounded">
        {rs.groups.map((group) => {
          const toggleCollapsible = () =>
            setCollapsibles((cl) => ({ ...cl, [group.id!]: !cl[group.id!] }));

          const collapsibleIsOpen = collapsibles[group.id!] ?? false;

          const inputId = `group-selector-button-${group.id}`;

          return (
            <li
              key={group.id}
              className="grid items-center grid-cols-[min-width_auto_min-width] gap-2"
            >
              <input
                id={inputId}
                type="radio"
                radioGroup="a"
                checked={rs.groupId === group.id}
                onChange={() => {
                  dispatch(red.setGroupId(group.id!));
                  nodes.pop();
                }}
                className="w-min"
              />

              <label htmlFor={inputId}>{group.name}</label>

              <div
                onClick={toggleCollapsible}
                className="cursor-pointer col-start-3"
              >
                <div className={collapsibleIsOpen ? "rotate-90" : "-rotate-90"}>
                  &lt;
                </div>
              </div>

              {collapsibleIsOpen && (
                <ViewSelectorListing
                  prefix={"/groups/" + group.id}
                  className="col-start-2"
                />
              )}
            </li>
          );
        })}
      </ul>
    </Canceler>
  );
}
