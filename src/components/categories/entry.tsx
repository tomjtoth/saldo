"use client";

import { useState } from "react";

import { useAppDispatch, useGroupSelector } from "@/lib/hooks";
import { appToast, err, sendJSON, status } from "@/lib/utils";
import { TCategory } from "@/lib/db";
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
  const isDefault = rs.group?.memberships?.at(0)?.defaultCategoryId === cat.id;

  return (
    <>
      {showDetails && (
        <Canceler onClick={hideDetails}>
          <Details {...{ cat, hideDetails }} />
        </Canceler>
      )}

      <div
        className={
          "category cursor-pointer select-none text-center p-2 rounded border-2 " +
          (status(cat).active ? "border-green-500" : "border-red-500")
        }
        onClick={() => setShowDetails(true)}
      >
        <SvgStar
          fill={isDefault ? "#FB0" : "#AAA"}
          onClick={(ev) => {
            ev.stopPropagation();
            if (!isDefault)
              appToast.promise(
                sendJSON(
                  "/api/categories",
                  {
                    id: cat.id,
                    groupId: cat.groupId,
                    setAsDefault: true,
                  },
                  { method: "PUT" }
                ).then(() => {
                  dispatch(
                    red.updateDefaultCatId({
                      catId: cat.id!,
                      groupId: cat.groupId!,
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
