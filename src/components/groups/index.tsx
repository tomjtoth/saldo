"use client";

import { ReactNode, useEffect } from "react";
import { toast } from "react-toastify";

import {
  useAppDispatch,
  useGroupIdPreselector,
  useGroupSelector,
} from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";
import { err, has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";

import Entry from "./entry";
import NameDescrAdder from "../name-descr-adder";
import Header from "../header";

export default function CliGroupsPage({
  userMenu,

  groupId,
  ...srv
}: {
  userMenu: ReactNode;

  groupId?: number;
  defaultGroupId?: number;
  groups: TGroup[];
}) {
  const rs = useGroupSelector(srv.groups);
  const dispatch = useAppDispatch();

  useGroupIdPreselector("/groups", groupId);

  useEffect(() => {
    dispatch(red.init(srv));
  }, []);

  return (
    <>
      <Header {...{ userMenu }}>
        <h2>Groups</h2>
      </Header>

      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        groups are not visible in categories, nor in receipts.
      </p>
      <div className="p-2 flex flex-wrap gap-2 justify-center">
        <NameDescrAdder
          placeholder="Group"
          handler={({ name, description }) =>
            new Promise<boolean>((done) => {
              try {
                has3ConsecutiveLetters(name);
              } catch (err) {
                return toast.error(
                  (err as Error).message as string,
                  appToast.theme()
                );
              }

              appToast.promise(
                sendJSON(`/api/groups`, {
                  name,
                  description,
                })
                  .then(async (res) => {
                    if (!res.ok) err(res.statusText);

                    const body = await res.json();
                    dispatch(red.addGroup(body as TGroup));
                    done(true);
                  })
                  .catch((err) => {
                    done(false);
                    throw err;
                  }),
                `Saving group "${name}" to db`
              );
            })
          }
        />

        {rs.groups.map((group) => (
          <Entry
            key={group.id}
            group={group}
            preSelected={!!groupId && groupId === group.id}
          />
        ))}
      </div>
    </>
  );
}
