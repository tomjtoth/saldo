"use client";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { useRootDivCx } from "../rootDiv/clientSide";

import Entry from "./entry";
import NameDescrAdder from "../nameDescrAdder";
import Header from "../header";

export default function CliGroupsPage() {
  const rs = useGroupSelector();
  const dispatch = useAppDispatch();
  const preSelectedId = useRootDivCx().groupId;

  return (
    <>
      <Header>
        <h2>Groups</h2>
      </Header>

      {/* TODO: refactor to FnComponent({txt: string}) */}
      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        {/* txt */}
        groups are not visible in categories, nor in receipts.
      </p>

      <div className="p-2 flex flex-wrap gap-2 justify-center">
        <NameDescrAdder
          placeholder="Group"
          handler={async (data) => dispatch(red.addGroup(data))}
        />

        {rs.groups.map((group) => (
          <Entry
            key={group.id}
            group={group}
            preSelected={preSelectedId === group.id}
          />
        ))}
      </div>
    </>
  );
}
