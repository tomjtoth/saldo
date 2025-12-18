"use client";

import { MouseEventHandler, ReactNode, useEffect, useState } from "react";

import { useBodyNodes } from "../_lib/hooks";
import { is } from "../_lib/utils";

const CHILD_CLASSES = {
  center: "*:absolute *:left-1/2 *:top-1/2 *:-translate-1/2",
  pad: "*:p-2",
  maxes: "*:max-h-9/10 *:max-w-9/10",
  bg: "*:bg-background",
  border: "*:border *:rounded",
};

export default function Canceler({
  children,
  onClick: callback,
  className = "z-1",
  classNamesFor: {
    blurred: clsBlurred = "backdrop-opacity-100 bg-background/50",
    children: clsChildren = {},
  } = {},
}: {
  children: ReactNode;
  onClick?: MouseEventHandler;
  className?: string;
  classNamesFor?: {
    blurred?: string;
    children?: {
      [K in keyof typeof CHILD_CLASSES]?: (typeof CHILD_CLASSES)[K];
    };
  };
}) {
  const nodes = useBodyNodes();

  let clsBase =
    "absolute top-0 left-0 h-full w-full " +
    "transition duration-500 backdrop-blur-sm backdrop-opacity-0";

  if (className) clsBase += ` ${className}`;

  Object.entries(CHILD_CLASSES).forEach(([key, val]) => {
    const override = clsChildren[key as keyof typeof clsChildren];

    clsBase += is.undefined(override)
      ? ` ${val}`
      : override.length > 0
      ? ` ${override}`
      : ""; // effectively disabling it
  });

  const [classes, setClasses] = useState(clsBase);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (clsBlurred) setClasses(`${clsBase} ${clsBlurred}`);
  }, []);

  return (
    <div
      className={classes}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) {
          (callback ?? nodes.pop)(ev);
        }
      }}
    >
      {children}
    </div>
  );
}
