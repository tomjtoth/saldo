"use client";

import { useState } from "react";

import { useAppDispatch, useBodyNodes, useClientState } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import Header from "@/app/_components/header";
import ConsumptionSettings from "./settings";
import ConsumptionChart from "./chart";

export default function ConsumptionPage(srv: { from?: string; to?: string }) {
  const nodes = useBodyNodes();
  const dispatch = useAppDispatch();
  const consumption = useClientState("consumption");

  const [from, setFrom] = useState(srv.from ?? "");
  const [to, setTo] = useState(srv.to ?? "");

  return (
    <>
      <Header className="flex gap-2">
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
        <button
          className="py-1!"
          onClick={() => nodes.push(ConsumptionSettings)}
        >
          ⚙️ <span className="hidden sm:inline-block">settings</span>
        </button>
      </Header>

      <div className="p-2 h-full flex flex-col gap-2 items-center">
        {(consumption.length ?? 0) > 0 ? (
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
