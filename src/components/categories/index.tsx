"use client";

import { ReactNode, useEffect } from "react";
import { toast } from "react-toastify";

import { TCategory, TGroup } from "@/lib/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { err, has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";

import NameDescrAdder from "../name-descr-adder";
import Entry from "./entry";
import GroupSelector from "../groups/selector";
import Header from "../header";
import Link from "next/link";

export default function CliCategoriesPage(srv: {
  userMenu: ReactNode;
  groups: TGroup[];
}) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((s) => {
    const local = s.combined.groups;
    return local.length > 0 ? local : srv.groups;
  });
  const groupId = useAppSelector((s) => s.combined.id ?? srv.groups.at(0)?.id);

  useEffect(() => {
    dispatch(red.init(srv.groups));
  }, []);

  return (
    <>
      <Header userMenu={srv.userMenu}>
        <h2>
          <GroupSelector fallback={srv.groups} /> Categories
        </h2>
      </Header>

      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        categories cannot be assigned to items.
      </p>

      <div className="p-2 flex flex-wrap gap-2 justify-center">
        {groups.length > 0 ? (
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
                    groupId,
                    name,
                    description,
                  })
                    .then(async (res) => {
                      if (!res.ok) err(res.statusText);

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
          />
        ) : (
          <p>
            You have no access to active groups currently,{" "}
            <Link href="/groups">create or enable one</Link>!
          </p>
        )}

        {groups
          .find((grp) => grp.id === groupId)
          ?.Categories?.map((cat) => (
            <Entry key={cat.id} cat={cat} />
          ))}
      </div>
    </>
  );
}
