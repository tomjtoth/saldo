"use client";

import { useMemo } from "react";

import { useAppDispatch, useClientState, useRootDivCx } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import EntityAdderButton from "@/app/_components/entityAdder";
import Header from "@/app/_components/header";
import Entry from "./entry";

export default function CliGroupsPage() {
  const groups = useClientState("groups");
  const dispatch = useAppDispatch();
  const preSelectedId = useRootDivCx().groupId;

  const listing = useMemo(
    () =>
      groups.map((group) => (
        <Entry
          key={group.id}
          group={group}
          preSelected={preSelectedId === group.id}
        />
      )),
    [groups, preSelectedId]
  );

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

      <div className="p-2 flex flex-wrap gap-2 justify-center">{listing}</div>
    </>
  );
}
