"use client";

import { useState } from "react";

import { TGroup } from "@/lib/models";

import Canceler from "../canceler";
import Details from "./details";

export default function Entry({ group }: { group: TGroup }) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      {showDetails && (
        <>
          <Canceler onClick={() => setShowDetails(false)} />
          <Details {...{ group }} />
        </>
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
