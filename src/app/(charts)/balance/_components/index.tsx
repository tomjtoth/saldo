"use client";

import { useClientState } from "@/app/_lib/hooks";

import Header from "@/app/_components/header";
import BalanceChart from "./chart";

export default function CliBalancePage() {
  const cs = useClientState();

  return (
    <>
      <Header />

      <div className="p-2 h-full flex flex-col gap-2 items-center">
        {!!cs.group ? (
          <BalanceChart {...cs.group.balance!} />
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
