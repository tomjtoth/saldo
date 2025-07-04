"use client";

import { ReactNode, useEffect, useState } from "react";

import {
  useAppDispatch,
  useGroupIdPreselector,
  useGroupSelector,
} from "@/lib/hooks";
import { dateToInt, EUROPE_HELSINKI } from "@/lib/utils";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";

import BalanceChart, { TBalanceChartData } from "./chart";
import Header from "../header";
import GroupSelector from "../groups/selector";
import { DateTime } from "luxon";

export default function CliBalancePage(srv: {
  userMenu: ReactNode;

  groupId?: number;
  groups: TGroup[];

  data: {
    [groupId: number]: TBalanceChartData;
  };
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector(srv.groups);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("srv.to");
  const [data, setData] = useState(srv.data);

  useGroupIdPreselector("/balance", srv.groupId);
  useEffect(() => {
    dispatch(red.init({ groups: srv.groups }));
  }, []);

  return (
    <>
      <Header userMenu={srv.userMenu}>Balance</Header>
      <div className="p-2 h-full flex flex-col gap-2 items-center">
        <form
          className="flex flex-wrap gap-2 items-center justify-center"
          onSubmit={(ev) => {
            ev.preventDefault();

            setData(
              Object.fromEntries(
                Object.entries(srv.data).map(
                  ([groupId, { relations, data }]) => [
                    Number(groupId),
                    {
                      relations,
                      data: data.filter(({ date }) => {
                        let res = true;

                        const dateFrom = DateTime.fromISO(
                          from,
                          EUROPE_HELSINKI
                        );

                        if (
                          dateFrom.isValid &&
                          date < dateToInt(dateFrom.toISODate())
                        ) {
                          res = false;
                        }
                        const dateTo = DateTime.fromISO(to, EUROPE_HELSINKI);

                        if (
                          dateTo.isValid &&
                          date > dateToInt(dateTo.toISODate())
                        ) {
                          res = false;
                        }

                        return res;
                      }),
                    },
                  ]
                )
              )
            );
          }}
        >
          <label>
            group: <GroupSelector fallback={srv.groups} />
          </label>
          <label>
            from:{" "}
            <input
              type="date"
              value={from}
              onChange={(ev) => setFrom(ev.target.value)}
            />
          </label>
          <label>
            to:{" "}
            <input
              type="date"
              value={to}
              onChange={(ev) => setTo(ev.target.value)}
            />
          </label>
          <button>filter</button>
        </form>

        {!!rs.groupId && <BalanceChart {...data[rs.groupId]} />}
      </div>
    </>
  );
}
