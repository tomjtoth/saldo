"use client";

import { useEffect } from "react";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { rGroups as red } from "@/lib/reducers/groups";

import Entry from "./entry";
import NameDescrAdder from "../name-descr-adder";
import { err, has3WordChars, sendJSON, toastifyMsgs } from "@/lib/utils";
import { toast } from "react-toastify";

export default function CliGroupsPage({
  groups: fromDB,
}: {
  groups: TGroup[];
}) {
  const groups = useAppSelector((s) => s.groups);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(red.init(fromDB));
  }, []);

  return (
    <div className="p-2 flex flex-wrap gap-2 justify-center">
      <NameDescrAdder
        handler={({ name, description }) =>
          new Promise<boolean>((done) => {
            try {
              has3WordChars(name);
            } catch (err) {
              toast.error(err as string);
              return done(false);
            }

            toast.promise(
              sendJSON(`/api/groups`, {
                name,
                description,
              }).then(async (res) => {
                if (!res.ok) {
                  done(false);
                  err();
                }

                const body = await res.json();
                dispatch(red.add(body as TGroup));
                done(true);
              }),
              toastifyMsgs(`Saving group "${name}" to db`)
            );
          })
        }
      />

      {(groups.length > 0 ? groups : fromDB).map((grp) => (
        <Entry key={grp.id} group={grp} />
      ))}
    </div>
  );
}
