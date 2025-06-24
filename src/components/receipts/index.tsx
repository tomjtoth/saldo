"use client";

import { ReactNode, useEffect } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";

import Header from "../header";
import Adder from "./adder";
import GroupSelector from "../groups/selector";

export default function CliReceiptsPage({
  userMenu,
  groupId,
  ...srv
}: {
  userMenu: ReactNode;

  userId: number;
  groupId?: number;
  defaultGroupId?: number;
  groups: TGroup[];
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector(srv.groups);

  useEffect(() => {
    dispatch(red.init(srv));

    if (groupId) {
      window.history.replaceState(null, "", "/receipts");
      dispatch(red.setGroupId(groupId));
    }
  }, []);

  return (
    <>
      <Header userMenu={userMenu} className="flex gap-2">
        <h2>Receipts</h2>
      </Header>

      <div className="p-2 text-center">
        Showing receipts only for group: <GroupSelector fallback={srv.groups} />
        <Adder />
      </div>

      <div className="p-2 flex flex-wrap justify-evenly items-center gap-2">
        {rs.groups.length == 0 ? null : (
          <>
            {rs.group()?.Receipts?.map((rcpt) => (
              <div
                key={rcpt.id}
                className="p-2 shrink-0 border rounded flex gap-2 cursor-pointer select-none"
              >
                <span>🛍️ {rcpt.Items?.length}: </span>

                <span>
                  € {rcpt.Items?.reduce((sub, { cost }) => sub + cost, 0)}
                </span>

                <span>🗓️ {rcpt.paidOn}</span>

                <span>
                  🪪{" "}
                  {rcpt.archives!.length > 0
                    ? rcpt.archives?.at(0)?.Revision?.User?.name
                    : rcpt.Revision?.User?.name}
                </span>

                <span>💸 {rcpt.User?.name}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
