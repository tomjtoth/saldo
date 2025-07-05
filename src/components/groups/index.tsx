"use client";

import { ReactNode } from "react";
import { toast } from "react-toastify";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";
import { err, has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";

import Entry from "./entry";
import NameDescrAdder from "../name-descr-adder";
import Header from "../header";
import CliCommonCx from "../common-context";

export default function CliGroupsPage(srv: {
  userMenu: ReactNode;
  groupId?: number;
  defaultGroupId?: number;
  groups: TGroup[];
}) {
  const rs = useGroupSelector(srv.groups);
  const dispatch = useAppDispatch();

  return (
    <CliCommonCx {...{ srv, rewritePath: "/groups" }}>
      <Header>
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
            preSelected={!!srv.groupId && srv.groupId === group.id}
          />
        ))}
      </div>
    </CliCommonCx>
  );
}
