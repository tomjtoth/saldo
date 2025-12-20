"use client";

import { useMemo } from "react";

import { useAppDispatch, useClientState, useDebugger } from "@/app/_lib/hooks";
import { thunks } from "@/app/_lib/reducers";
import { Category } from "../_lib";
import { appToast, virt } from "@/app/_lib/utils";

import EntityAdderButton from "@/app/_components/entityAdder";
import Header from "@/app/_components/header";
import CategoryEntry from "./entry";

export default function CategoriesPage(srv: { categoryId?: Category["id"] }) {
  const dispatch = useAppDispatch();
  const user = useClientState("user");
  const group = useClientState("group");
  const groups = useClientState("groups");

  const defaultCategoryId = group?.memberships.find(
    (ms) => ms.userId === user?.id
  )?.defaultCategoryId;

  const categoriesListing = useMemo(
    () =>
      group?.categories.map((cat) => (
        <CategoryEntry
          key={cat.id}
          categoryId={cat.id}
          defaultId={defaultCategoryId}
          preSelected={srv.categoryId === cat.id}
        />
      )),
    [group?.categories, srv.categoryId, defaultCategoryId]
  );

  useDebugger({ categoriesListing });

  const groupIsActive = useMemo(() => group && virt(group).active, [group]);

  return (
    <>
      <Header>
        {groups.length > 0 && (
          <EntityAdderButton
            placeholder="Category"
            className={
              groupIsActive ? undefined : "cursor-not-allowed! text-gray-500"
            }
            onClick={
              groupIsActive
                ? undefined
                : () =>
                    appToast.error(
                      "Adding new categories to a disabled group is not allowed!"
                    )
            }
            handler={({ name, description }) =>
              dispatch(
                thunks.addCategory({ groupId: group!.id, name, description })
              )
            }
          />
        )}
      </Header>

      <p className="p-2 text-center">
        <span className="p-1 rounded border-2 border-red-500">INACTIVE</span>{" "}
        categories cannot be assigned to items.
      </p>

      <div className="p-2 flex flex-wrap gap-2 justify-center">
        {categoriesListing}
      </div>
    </>
  );
}
