"use client";

import { ReactNode, useEffect, useState } from "react";

import {
  useAppDispatch,
  useGroupIdPreselector,
  useGroupSelector,
} from "@/lib/hooks";
import { appToast, err } from "@/lib/utils";
import { TGroup } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";

import ParetoChart, { TParetoChartData } from "./chart";
import Header from "../header";
import GroupSelector from "../groups/selector";

export default function CliParetoPage(srv: {
  userMenu: ReactNode;

  groupId?: number;
  groups: TGroup[];
  data: {
    [groupId: number]: TParetoChartData;
  };
  from?: string;
  to?: string;
}) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector(srv.groups);

  const [from, setFrom] = useState(srv.from);
  const [to, setTo] = useState(srv.to);
  const [data, setData] = useState(srv.data);

  useGroupIdPreselector("/pareto", srv.groupId);
  useEffect(() => {
    dispatch(red.init({ groups: srv.groups }));
  }, []);

  return (
    <>
      <Header userMenu={srv.userMenu}>Pareto</Header>
      <div className="p-2 h-full flex flex-col gap-2 items-center">
        <form
          className="flex flex-wrap gap-2 items-center justify-center"
          onSubmit={(ev) => {
            ev.preventDefault();

            appToast.promise(
              fetch(`/api/pareto?from=${from}&to=${to}`)
                .then(async (res) => {
                  if (!res.ok) err(res.statusText);

                  const body = await res.json();
                  setData(body.data);
                })
                .catch((err) => {
                  setFrom(srv.from);
                  setTo(srv.to);

                  throw err;
                }),
              "Fetching data"
            );

            // setData();
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
          <button>update</button>
        </form>

        {!!rs.groupId && <ParetoChart {...data[rs.groupId]} />}
      </div>
    </>
  );
}
