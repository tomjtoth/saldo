"use client";

import { toast } from "react-toastify";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { has3ConsecutiveLetters, appToast } from "@/lib/utils";
import { useRootDivCx } from "../rootDiv/clientSide";
import { svcCreateGroup } from "@/lib/services/groups";

import Entry from "./entry";
import NameDescrAdder from "../nameDescrAdder";
import Header from "../header";

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
          handler={async ({ name, description }) => {
            try {
              has3ConsecutiveLetters(name);
            } catch (err) {
              toast.error((err as Error).message as string, appToast.theme());
              throw err;
            }

            const op = svcCreateGroup(name, description);
            appToast.promise(op, `Saving group "${name}" to db`);

            const res = await op;
            dispatch(red.addGroup(res));
          }}
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
