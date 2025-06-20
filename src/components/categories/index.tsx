"use client";

import { ReactNode, useEffect, useState } from "react";
import { toast } from "react-toastify";

import { TCategory, TGroup } from "@/lib/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { err, has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";

import NameDescrAdder from "../name-descr-adder";
import Entry from "./entry";
import GroupSelector from "../groups/selector";
import Header from "../header";

export default function CliCategoriesPage(srv: {
  userMenu: ReactNode;
  cats: TCategory[];
  groups: TGroup[];
}) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((s) => s.categories.groups);
  const cats = useAppSelector((s) => s.categories.cats);
  const [groupId, setGroupId] = useState(srv.groups[0].id);

  useEffect(() => {
    dispatch(red.init({ groups: srv.groups, cats: srv.cats }));
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
        <NameDescrAdder
          id="category-adder"
          handler={({ name, description }) =>
            new Promise<boolean>((done) => {
              try {
                has3ConsecutiveLetters(name);
              } catch (err) {
                toast.error((err as Error).message as string, appToast.theme());
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
                    dispatch(red.add(body as TCategory));
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

        {cats
          .filter((cat) => cat.groupId === groupId)
          .map((cat) => (
            <Entry key={cat.id} cat={cat} />
          ))}
      </div>
    </>
  );
}
