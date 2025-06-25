"use client";

import { PropsWithChildren, useEffect, useState } from "react";

export default function Canceler({
  onClick: callback,
  zIndex = 0,
  className = "",
  classNameBlurred: clsBlurred = "blurred bg-background/50",
  children,
}: PropsWithChildren & {
  onClick: () => void;
  zIndex?: number;
  className?: string;
  classNameBlurred?: string;
}) {
  const clsBase = (
    "absolute top-0 left-0 h-full w-full canceler " + className
  ).trim();

  const [classes, setClasses] = useState(clsBase);

  useEffect(() => {
    if (clsBlurred) setClasses(`${clsBase} ${clsBlurred}`);
  }, []);

  return (
    <div
      className={classes}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) callback();
      }}
      style={{ zIndex }}
    >
      {children}
    </div>
  );
}
