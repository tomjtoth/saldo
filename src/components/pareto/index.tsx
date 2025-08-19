"use client";

import { useState } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { appToast, err } from "@/lib/utils";
import { rCombined as red } from "@/lib/reducers";

import ParetoChart from "./chart";
import Header from "../header";
import GroupSelector from "../groups/selector";

export default function CliParetoPage(srv: { from?: string; to?: string }) {
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();

  const [from, setFrom] = useState(srv.from ?? "");
  const [to, setTo] = useState(srv.to ?? "");

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
              fetch(`/api/pareto?from=${from}&to=${to}`)
                .then(async (res) => {
                  const groups = await res.json();
                  dispatch(red.init({ groups }));
                })
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
          <ParetoChart {...group.pareto!} />
        ) : (
          <div className="grow flex items-center">
            <h2>no data to show</h2>
          </div>
        )}
      </div>
    </>
  );
}
