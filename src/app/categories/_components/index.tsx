"use client";

import { useMemo } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import EntityAdderButton from "@/app/_components/entityAdder";
import Header from "@/app/_components/header";
import Entry from "./entry";

export default function CliCategoriesPage(srv: { catId?: number }) {
  const dispatch = useAppDispatch();
  const group = useClientState("group");
  const groups = useClientState("groups");

  const listing = useMemo(
    () =>
      group?.categories.map((cat) => (
        <Entry key={cat.id} cat={cat} preSelected={srv.catId === cat.id} />
      )),
    [group?.categories, srv.catId]
  );

  return (
    <>
      <Header>
        {groups.length > 0 && (
          <EntityAdderButton
            placeholder="Category"
            handler={({ name, description }) =>
              dispatch(
                thunks.addCategory({ groupId: group!.id, name, description })
              )
            }
          />
        )}
      </Header>

      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        categories cannot be assigned to items.
      </p>

      <div className="p-2 flex flex-wrap gap-2 justify-center">{listing}</div>
    </>
  );
}
