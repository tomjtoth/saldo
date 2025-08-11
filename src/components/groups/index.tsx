"use client";

import { toast } from "react-toastify";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { TGroup } from "@/lib/db";
import { rCombined as red } from "@/lib/reducers";
import { err, has3ConsecutiveLetters, sendJSON, appToast } from "@/lib/utils";

import Entry from "./entry";
import NameDescrAdder from "../nameDescrAdder";
import Header from "../header";
import { useRootDivCx } from "../rootDiv/clientSide";

export default function CliGroupsPage() {
  const rs = useGroupSelector();
  const dispatch = useAppDispatch();
  const preSelectedId = useRootDivCx().groupId;

  return (
    <>
      <Header>
        <h2>Groups</h2>
      </Header>

      {/* TODO: refactor to FnComponent({txt: string}) */}
      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        {/* txt */}
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
            preSelected={preSelectedId === group.id}
          />
        ))}
      </div>
    </>
  );
}
