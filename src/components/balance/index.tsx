"use client";

import { ReactNode, useEffect, useState } from "react";
import { DateTime } from "luxon";

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

export default function CliBalancePage({
  userMenu,
  ...srv
}: {
  userMenu: ReactNode;

  groupId?: number;
  groups: TGroup[];
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector(srv.groups);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState<TBalanceChartData | undefined>();

  const dateFrom = DateTime.fromISO(from, EUROPE_HELSINKI);
  const dateTo = DateTime.fromISO(to, EUROPE_HELSINKI);

  const filter = () => {
    const set = rs.group()?.balance;
    if (!set) return;

    const { relations, data } = set;

    setFiltered({
      relations,
      data: data.filter(({ date }) => {
        let res = true;

        if (dateFrom.isValid && date < dateToInt(dateFrom.toISODate())) {
          res = false;
        }
        if (dateTo.isValid && date > dateToInt(dateTo.toISODate())) {
          res = false;
        }

        return res;
      }),
    });
  };

  useGroupIdPreselector("/balance", srv.groupId);
  useEffect(() => {
    dispatch(red.init(srv));
  }, []);

  useEffect(() => {
    if (rs.groupId) filter();
  }, [rs.groupId]);

  return (
    <>
      <Header userMenu={userMenu}>Balance</Header>
      <div className="p-2 h-full flex flex-col gap-2 items-center">
        <form
          className="flex flex-wrap gap-2 items-center justify-center"
          onSubmit={(ev) => {
            ev.preventDefault();
            filter();
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

        {!!filtered && filtered.data.length > 0 ? (
          <BalanceChart {...filtered} />
        ) : (
          <div className="grow flex items-center">
            <h2 className="rounded border-2 border-red-500">
              There is no data to show with those filters
            </h2>
          </div>
        )}
      </div>
    </>
  );
}
