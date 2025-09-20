"use client";

import { useState } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { appToast } from "@/lib/utils";
import { rCombined as red } from "@/lib/reducers";
import { svcGetParetoData } from "@/lib/services/pareto";

import ParetoChart from "./chart";
import Header from "../header";
import GroupSelector from "../groups/selector";
import ChartStyler from "../chartStyler";
import Canceler from "../canceler";

export default function CliParetoPage(srv: { from?: string; to?: string }) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();

  const [from, setFrom] = useState(srv.from ?? "");
  const [to, setTo] = useState(srv.to ?? "");

  const [showStyler, setShowStyler] = useState(false);

  const group = rs.group;

  return (
    <>
      <Header>
        <h2>Pareto</h2>
      </Header>
      <div className="p-2 h-full flex flex-col gap-2 items-center">
        <form
          className="flex flex-wrap gap-2 items-center justify-center"
          onSubmit={(ev) => {
            ev.preventDefault();

            appToast.promise(
              svcGetParetoData({ from, to })
                .then((groups) => dispatch(red.init({ groups })))
                .catch((err) => {
                  setFrom("");
                  setTo("");

                  throw err;
                }),
              "Fetching data"
            );
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
          <button>fetch</button>
        </form>

        {!!group && (group.pareto?.categories.length ?? 0) > 0 ? (
          <>
            {showStyler ? (
              <Canceler onClick={() => setShowStyler(false)}>
                <ChartStyler users={group.pareto!.users} />
              </Canceler>
            ) : null}
            <ParetoChart
              {...{
                ...group.pareto!,
                onLegendClick: () => setShowStyler(!showStyler),
              }}
            />
          </>
        ) : (
          <div className="grow flex items-center">
            <h2>no data to show</h2>
          </div>
        )}
      </div>
    </>
  );
}
