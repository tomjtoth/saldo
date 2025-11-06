"use client";

import { useGroupSelector } from "@/app/_lib/hooks";

import Header from "@/app/_components/header";
import BalanceChart from "./chart";

export default function CliBalancePage() {
  const rs = useGroupSelector();

  return (
    <>
      <Header />

      <div className="p-2 h-full flex flex-col gap-2 items-center">
        {!!rs.group ? (
          <BalanceChart {...rs.group.balance!} />
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
