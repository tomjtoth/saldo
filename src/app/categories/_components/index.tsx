"use client";

import Link from "next/link";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";

import NameDescrAdder from "@/components/nameDescrAdder";
import Entry from "./entry";
import GroupSelector from "@/components/groups/selector";
import Header from "@/components/header";

export default function CliCategoriesPage(srv: { catId?: number }) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();

  return (
    <>
      <Header>
        <h2>Categories</h2>
      </Header>

      <div className="p-2 text-center">
        {rs.groups.length > 0 ? (
          <>
            <NameDescrAdder
              placeholder="Category"
              handler={({ name, description }) =>
                dispatch(red.addCategory(rs.groupId!, name, description))
              }
            />{" "}
            category for group: <GroupSelector />
          </>
        ) : (
          <p>
            You have no access to active groups currently,{" "}
            <Link href="/groups">create or enable one</Link>!
          </p>
        )}
      </div>

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
