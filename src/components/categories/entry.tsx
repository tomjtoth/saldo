"use client";

import { useState } from "react";

import { TCategory } from "@/lib/models";

import Canceler from "../canceler";
import Details from "./details";

export default function Entry({ cat }: { cat: TCategory }) {
  const [showDetails, setShowDetails] = useState(false);
  const hideDetails = () => setShowDetails(false);

  return (
    <>
      {showDetails && (
        <>
          <Canceler onClick={hideDetails} />
          <Details {...{ cat, hideDetails }} />
        </>
      )}

      <div
        className={
          "cursor-pointer select-none p-2 rounded border-2 " +
          (cat.statusId === 1 ? "border-green-500" : "border-red-500")
        }
        onClick={() => setShowDetails(true)}
      >
        {cat.name}
      </div>
    </>
  );
}
