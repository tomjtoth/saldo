"use client";

import { useClientState } from "@/app/_lib/hooks";
import { BalanceChartCx, useBalanceChartHook } from "../_lib/hook";

import Header from "@/app/_components/header";
import BalanceChart from "./chart";

export default function BalancePage() {
  const group = useClientState("group");
  const hook = useBalanceChartHook();

  return (
    <BalanceChartCx.Provider value={hook}>
      <Header>
        {hook?.isZoomedIn() && (
          <button onClick={hook.zoomOut}>
            🔎 <span className="hidden sm:inline-block">zoom out</span>
          </button>
        )}
      </Header>

      {group?.balance && <BalanceChart />}
    </BalanceChartCx.Provider>
  );
}
