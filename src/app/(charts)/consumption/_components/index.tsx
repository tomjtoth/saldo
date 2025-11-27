"use client";

import { useState } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import Header from "@/app/_components/header";
import ConsumptionChart from "./chart";

export default function CliConsumptionPage(srv: {
  from?: string;
  to?: string;
}) {
  const dispatch = useAppDispatch();
  const group = useClientState("group");

  const [from, setFrom] = useState(srv.from ?? "");
  const [to, setTo] = useState(srv.to ?? "");

  return (
    <>
      <Header>
        <form
          className="flex flex-wrap gap-2 items-center justify-left"
          onSubmit={(ev) => {
            ev.preventDefault();
            dispatch(thunks.updateConsumption({ from, to })).catch(() => {
              setFrom("");
              setTo("");
            });
          }}
        >
          <label>
            <span className="hidden sm:inline-block sm:pr-2">from: </span>
            <input
              type="date"
              value={from}
              onChange={(ev) => setFrom(ev.target.value)}
            />
          </label>
          <label>
            <span className="hidden sm:inline-block sm:pr-2">to: </span>
            <input
              type="date"
              value={to}
              onChange={(ev) => setTo(ev.target.value)}
            />
          </label>
          <button className="py-1!">fetch</button>
        </form>
      </Header>

      <div className="p-2 h-full flex flex-col gap-2 items-center">
        {(group?.consumption.length ?? 0) > 0 ? (
          <ConsumptionChart />
        ) : (
          <div className="grow flex items-center">
            <h2>no data to show</h2>
          </div>
        )}
      </div>
    </>
  );
}
