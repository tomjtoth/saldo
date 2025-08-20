"use client";

import { toast } from "react-toastify";
import Link from "next/link";

import { TCategory } from "@/lib/db";
import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";

import NameDescrAdder from "../nameDescrAdder";
import Entry from "./entry";
import GroupSelector from "../groups/selector";
import Header from "../header";

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
              id="category-adder"
              handler={({ name, description }) =>
                new Promise<boolean>((done) => {
                  try {
                    has3ConsecutiveLetters(name);
                  } catch (err) {
                    toast.error(
                      (err as Error).message as string,
                      appToast.theme()
                    );
                    return done(false);
                  }

                  appToast.promise(
                    sendJSON(`/api/categories`, {
                      groupId: rs.groupId,
                      name,
                      description,
                    })
                      .then(async (res) => {
                        const body = await res.json();
                        dispatch(red.addCat(body as TCategory));
                        done(true);
                      })
                      .catch((err) => {
                        done(false);
                        throw err;
                      }),
                    `Saving "${name}" to db`
                  );
                })
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
