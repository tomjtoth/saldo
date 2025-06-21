"use client";

import { PropsWithChildren, useEffect, useState } from "react";

export default function Canceler({
  onClick: callback,
  zIndex = 0,
  blur = true,
  children,
}: PropsWithChildren & {
  blur?: boolean;
  onClick: () => void;
  zIndex?: number;
}) {
  const classes = "absolute top-0 left-0 h-full w-full canceler";

  const [cn, setCN] = useState(classes);

  useEffect(() => {
    if (blur) setCN(classes + " dimmed");
  }, []);

  return (
    <div
      className={cn}
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) callback();
      }}
      style={{ zIndex }}
    >
      {children}
    </div>
  );
}
