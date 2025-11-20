"use client";

import { useState } from "react";

import { useAppDispatch, useClientState } from "@/app/_lib/hooks";
import { virt } from "@/app/_lib/utils";
import { Category } from "../_lib";
import { thunks } from "@/app/_lib/reducers";

import Canceler from "@/app/_components/canceler";
import SvgStar from "@/app/_components/star";
import Details from "./details";

export default function Entry({
  cat,
  preSelected,
}: {
  cat: Category;
  preSelected: boolean;
}) {
  const [showDetails, setShowDetails] = useState(preSelected);
  const hideDetails = () => setShowDetails(false);
  const dispatch = useAppDispatch();
  const cs = useClientState();
  const currentDefaultId = cs.group?.memberships.find(
    (ms) => ms.userId === cs.user?.id
  )?.defaultCategoryId;
  const isDefault = currentDefaultId === cat.id;

  return (
    <>
      {showDetails && (
        <Canceler onClick={hideDetails}>
          <Details {...{ cat, hideDetails }} />
        </Canceler>
      )}

      <div
        className={
          "cursor-pointer select-none text-center p-2 rounded border-2 " +
          (virt(cat).active ? "border-green-500" : "border-red-500")
        }
        onClick={() => setShowDetails(true)}
      >
        <SvgStar
          fill={isDefault ? "#FB0" : "#AAA"}
          onClick={(ev) => {
            ev.stopPropagation();
            if (!isDefault)
              dispatch(
                thunks.modDefaultCategoryId(
                  cat.id,
                  cat.groupId,
                  currentDefaultId
                )
              );
          }}
        />{" "}
        {cat.name}
      </div>
    </>
  );
}
