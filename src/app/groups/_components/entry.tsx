"use client";

import { useState } from "react";

import { Group } from "../_lib";
import { virt } from "@/app/_lib/utils";
import { useAppDispatch, useAppSelector } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";

import Canceler from "@/app/_components/canceler";
import SvgStar from "@/app/_components/star";
import Details from "./details";

export default function Entry({
  group,
  preSelected,
}: {
  group: Group;
  preSelected?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(preSelected ?? false);
  const dispatch = useAppDispatch();
  const isDefault = useAppSelector(
    (s) => s.combined.user?.defaultGroupId === group.id
  );

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
          (virt(group).active ? "border-green-500" : "border-red-500")
        }
        onClick={() => setShowDetails(true)}
      >
        <SvgStar
          fill={isDefault ? "#FB0" : "#AAA"}
          onClick={(ev) => {
            ev.stopPropagation();

            if (!isDefault) dispatch(thunks.setDefaultGroupId(group.id));
          }}
        />{" "}
        {group.name}
      </div>
    </>
  );
}
