"use client";

import { useEffect, useState } from "react";
import { DateTime } from "luxon";

import { useGroupSelector } from "@/lib/hooks";
import { dateToInt, EUROPE_HELSINKI } from "@/lib/utils";
import { TBalanceChartData } from "@/lib/db";

import BalanceChart from "./chart";
import Header from "../header";
import GroupSelector from "../groups/selector";

export default function CliBalancePage() {
  const rs = useGroupSelector();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [filtered, setFiltered] = useState<TBalanceChartData | undefined>(
    rs.group?.balance
  );

  const dateFrom = DateTime.fromISO(from, EUROPE_HELSINKI);
  const dateTo = DateTime.fromISO(to, EUROPE_HELSINKI);

  // TODO: migrate this to a working useMemo implementation
  // currently every single keystroke into the date filters triggers re-render
  const toBeMemoized =
    !!filtered && filtered.data.length > 0 ? (
      <BalanceChart {...filtered} />
    ) : (
      <div className="grow flex items-center">
        <h2 className="rounded border-2 border-red-500">
          There is no data to show with those filters
        </h2>
      </div>
    );

  const filter = () => {
    const set = rs.group?.balance;
    if (!set) return;

    setFiltered({
      ...set,
      data: set.data.filter(({ date }) => {
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

  useEffect(() => {
    if (rs.groupId) filter();
  }, [rs.groupId]);

  return (
    <>
      <Header>
        <h2>Balance</h2>
      </Header>
      <div className="p-2 h-full flex flex-col gap-2 items-center">
        <form
          className="flex flex-wrap gap-2 items-center justify-center"
          onSubmit={(ev) => {
            ev.preventDefault();
            filter();
          }}
        >
          <label>
            group: <GroupSelector />
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
        {toBeMemoized}
      </div>
    </>
  );
}
