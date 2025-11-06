"use client";

import { useAppDispatch, useGroupSelector } from "@/app/_lib/hooks";
import { rCombined as red } from "@/app/_lib/reducers";

import EntityAdderButton from "@/app/_components/entityAdder";
import Header from "@/app/_components/header";
import Entry from "./entry";

export default function CliCategoriesPage(srv: { catId?: number }) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();

  return (
    <>
      <Header>
        {rs.groups.length > 0 && (
          <EntityAdderButton
            placeholder="Category"
            handler={({ name, description }) =>
              dispatch(red.addCategory(rs.groupId!, name, description))
            }
          />
        )}
      </Header>

      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        categories cannot be assigned to items.
      </p>

      <div className="p-2 flex flex-wrap gap-2 justify-center">
        {rs.group?.categories?.map((cat) => (
          <Entry key={cat.id} cat={cat} preSelected={srv.catId === cat.id} />
        ))}
      </div>
    </>
  );
}
