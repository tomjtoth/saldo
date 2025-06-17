"use client";

import React from "react";

export default function Slider({
  checked,
  onClick: handler,
}: {
  checked: boolean;
  onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={
        "w-[60px] h-[40px] rounded-full border-1 cursor-pointer duration-200 ease-in-out " +
        (checked ? "bg-green-500" : "bg-red-500")
      }
      onClick={handler}
    >
      <div
        className={
          "top-[4px] w-[30px] h-[30px] rounded-full  relative " +
          "bg-background duration-200 ease-in-out " +
          (checked ? "left-[4px]" : "left-[24px]")
        }
      />
    </div>
  );
}
