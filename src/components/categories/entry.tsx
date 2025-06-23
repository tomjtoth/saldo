"use client";

import { useState } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { appToast, err, sendJSON } from "@/lib/utils";
import { TCategory } from "@/lib/models";
import { rCombined as red } from "@/lib/reducers";

import Canceler from "../canceler";
import Details from "./details";
import SvgStar from "../star";

export default function Entry({
  cat,
  preSelected,
}: {
  cat: TCategory;
  preSelected: boolean;
}) {
  const [showDetails, setShowDetails] = useState(preSelected);
  const hideDetails = () => setShowDetails(false);
  const dispatch = useAppDispatch();
  const rs = useGroupSelector();

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
          (cat.statusId === 1 ? "border-green-500" : "border-red-500")
        }
        onClick={() => setShowDetails(true)}
      >
        <SvgStar
          fill={
            rs.group()?.Memberships?.at(0)?.defaultCatId === cat.id
              ? "#FB0"
              : "#AAA"
          }
          onClick={(ev) => {
            ev.stopPropagation();
            appToast.promise(
              sendJSON(
                "/api/categories",
                {
                  id: cat.id,
                  groupId: cat.groupId,
                  setAsDefault: true,
                },
                { method: "PUT" }
              ).then(async (res) => {
                if (!res.ok) err(res.statusText);

                dispatch(
                  red.updateDefaultCatId({
                    catId: cat.id,
                    groupId: cat.groupId,
                  })
                );
              }),
              "Setting default category"
            );
          }}
        />{" "}
        {cat.name}
      </div>
    </>
  );
}
