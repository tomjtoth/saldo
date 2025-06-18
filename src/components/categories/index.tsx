"use client";

import { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { TCategory, TGroup } from "@/lib/models";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rCategories as red } from "@/lib/reducers/categories";

import NameDescrAdder from "../name-descr-adder";
import Entry from "./entry";
import GroupSelector from "../groups/selector";
import { err, has3WordChars, sendJSON, toastifyPromise } from "@/lib/utils";

export default function CliCategoriesPage(fromDB: {
  cats: TCategory[];
  groups: TGroup[];
}) {
  const dispatch = useAppDispatch();
  const groups = useAppSelector((s) => s.categories.groups);
  const cats = useAppSelector((s) => s.categories.cats);
  const [groupId, setGroupId] = useState(fromDB.groups[0].id);

  useEffect(() => {
    dispatch(red.init(fromDB));
  }, []);

  return (
    <>
      <div className="p-2">
        Showing only for{" "}
        <GroupSelector
          groups={groups.length > 0 ? groups : fromDB.groups}
          value={groupId}
          onChange={(ev) => setGroupId(Number(ev.target.value))}
        />
      </div>
      <div className="p-2 flex flex-wrap gap-2 justify-center">
        <NameDescrAdder
          id="category-adder"
          handler={({ name, description }) =>
            new Promise<boolean>((done) => {
              try {
                has3WordChars(name);
              } catch (err) {
                toast.error(err as string);
                return done(false);
              }

              toastifyPromise(
                sendJSON(`/api/categories`, {
                  groupId,
                  name,
                  description,
                }).then(async (res) => {
                  if (!res.ok) {
                    done(false);
                    err();
                  }

                  const body = await res.json();
                  dispatch(red.add(body as TCategory));
                  done(true);
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
