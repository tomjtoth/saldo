"use client";

import { PropsWithChildren } from "react";

import { useRootDivCx } from "./rootDiv/clientSide";

export default function Header({
  children,
  className: cn = "",
}: PropsWithChildren & {
  className?: string;
}) {
  const sidepanel = useRootDivCx().sidepanel;

  return (
    <header className="flex gap-2 p-2 items-center">
      {sidepanel}
      <div className={`grow ${cn}`}>{children}</div>
    </header>
  );
}
