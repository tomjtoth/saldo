"use client";

import { useClientState } from "@/app/_lib/hooks";
import { BalanceChartCx, useBalanceChartHook } from "../_lib/hook";

import Header from "@/app/_components/header";
import BalanceChart from "./chart";

export default function CliBalancePage() {
  const cs = useClientState();

  const hook = useBalanceChartHook(cs.group?.balance?.data ?? []);

  return (
    <BalanceChartCx.Provider
      value={{ users: cs.group?.balance?.users ?? [], hook }}
    >
      <Header>
        {hook.isZoomedIn() && <button onClick={hook.zoomOut}>zoom out</button>}
      </Header>

      {cs.group?.balance && <BalanceChart {...cs.group.balance} />}
    </BalanceChartCx.Provider>
  );
}
