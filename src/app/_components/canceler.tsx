"use client";

import { PropsWithChildren, useEffect, useState } from "react";

export default function Canceler({
  onClick: callback,
  className = "z-1",
  classNameBlurred: clsBlurred = "backdrop-opacity-100 bg-background/50",
  children,
}: PropsWithChildren & {
  onClick: () => void;
  className?: string;
  classNameBlurred?: string;
}) {
  let clsBase =
    "absolute top-0 left-0 h-full w-full " +
    "transition duration-500 backdrop-blur-sm backdrop-opacity-0 ";

  if (className) clsBase += ` ${className}`;

  const [classes, setClasses] = useState(clsBase);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (clsBlurred) setClasses(`${clsBase} ${clsBlurred}`);
  }, []);

  return (
    <div
      className={classes}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) callback();
      }}
    >
      {children}
    </div>
  );
}
