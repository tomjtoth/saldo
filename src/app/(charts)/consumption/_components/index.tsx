"use client";

import { useState } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { appToast } from "@/app/_lib/utils";
import { thunks } from "@/app/_lib/reducers";
import { apiGetConsumption } from "../_lib";

import Header from "@/app/_components/header";
import ConsumptionChart from "./chart";

export default function CliConsumptionPage(srv: {
  from?: string;
  to?: string;
}) {
  const dispatch = useAppDispatch();
  const cs = useClientState();

  const [from, setFrom] = useState(srv.from ?? "");
  const [to, setTo] = useState(srv.to ?? "");

  const group = cs.group;

  return (
    <>
      <Header>
        <form
          className="flex flex-wrap gap-2 items-center justify-left"
          onSubmit={(ev) => {
            ev.preventDefault();

            appToast.promise(
              apiGetConsumption({ from, to })
                .then((groups) => {
                  dispatch(thunks.init({ groups }));
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
        {!!group && (group.consumption?.categories.length ?? 0) > 0 ? (
          <ConsumptionChart {...group.consumption!} />
        ) : (
          <div className="grow flex items-center">
            <h2>no data to show</h2>
          </div>
        )}
      </div>
    </>
  );
}
