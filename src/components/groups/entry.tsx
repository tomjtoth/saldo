"use client";

import { useState } from "react";

import { TGroup } from "@/lib/db";
import { appToast, sendJSON, virt } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { rCombined as red } from "@/lib/reducers";
import { svcSetDefaultGroup } from "@/lib/services/groups";

import Canceler from "../canceler";
import Details from "./details";
import SvgStar from "../star";

export default function Entry({
  group,
  preSelected,
}: {
  group: TGroup;
  preSelected?: boolean;
}) {
  const [showDetails, setShowDetails] = useState(preSelected ?? false);
  const dispatch = useAppDispatch();
  const isDefault = useAppSelector(
    (s) => s.combined.defaultGroupId === group.id
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

            if (!isDefault)
              appToast.promise(
                svcSetDefaultGroup(group.id!).then(() => {
                  dispatch(red.setDefaultGroupId(group.id!));
                }),
                "Setting default group"
              );
          }}
        />{" "}
        {group.name}
      </div>
    </>
  );
}
