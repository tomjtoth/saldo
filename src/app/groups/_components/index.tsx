"use client";

import { useMemo } from "react";

import {
  useAppDispatch,
  useClientState,
  useDebugger,
  useRootDivCx,
} from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import EntityAdderButton from "@/app/_components/entityAdder";
import Header from "@/app/_components/header";
import GroupEntry from "./entry";

export default function GroupsPage() {
  const dispatch = useAppDispatch();
  const groups = useClientState("groups");
  const preSelectedId = useRootDivCx().groupId;

  const groupsListing = useMemo(
    () =>
      groups.map((group) => (
        <GroupEntry
          key={group.id}
          groupId={group.id}
          preSelected={preSelectedId === group.id}
        />
      )),
    [groups, preSelectedId]
  );

  useDebugger({ groupsListing });

  return (
    <>
      <Header>
        <EntityAdderButton
          placeholder="Group"
          handler={(data) => dispatch(thunks.addGroup(data))}
        />
      </Header>

      {/* TODO: refactor to FnComponent({txt: string}) */}
      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        {/* txt */}
        groups are not visible in categories, nor in receipts.
      </p>

      <div className="p-2 flex flex-wrap gap-2 justify-center">
        {groupsListing}
      </div>
    </>
  );
}
