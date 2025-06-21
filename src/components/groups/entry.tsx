"use client";

import { useState } from "react";

import { TGroup } from "@/lib/models";

import Canceler from "../canceler";
import Details from "./details";

export default function Entry({
  group,
  preSelected,
}: {
  group: TGroup;
  preSelected?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(preSelected ?? false);

  return (
    <>
      {showDetails && (
        <Canceler onClick={() => setShowDetails(false)}>
          <Details {...{ group }} />
        </Canceler>
      )}

      <div
        className={
          "cursor-pointer select-none p-2 rounded border-2 " +
          (group.statusId === 1 ? "border-green-500" : "border-red-500")
        }
        onClick={() => setShowDetails(true)}
      >
        {group.name}
      </div>
    </>
  );
}
