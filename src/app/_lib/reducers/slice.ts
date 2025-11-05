import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { TGroup, TItem, TReceipt, TUser } from "@/app/_lib/db";
import { sliceCategories } from "../../categories/_lib/reducers";
import { sliceGroups } from "../../groups/_lib/reducers";
import { sliceReceipts } from "../../receipts/_lib/reducers";

export interface TCliItem extends Omit<TItem, "cost"> {
  cost?: number | string;
}

export interface TCliGroup extends TGroup {
  activeReceipt?: Omit<TReceipt, "items"> & {
    focusedIdx?: number;
    items?: TCliItem[];
  };
}

export type CombinedState = {
  user?: TUser;
  groupId?: number;
  groups: TCliGroup[];
};

export type Initializer = Pick<CombinedState, "groups" | "user">;

export const slice = createSlice({
  name: "combined",
  initialState: { groups: [] } as CombinedState,

  reducers: {
    init(rs, { payload }: PayloadAction<Initializer>) {
      if (payload.user !== undefined) rs.user = payload.user;

      if (rs.groupId === undefined) {
        rs.groupId = payload.user?.defaultGroupId ?? payload.groups.at(0)?.id;
      }

      rs.groups = payload.groups;
    },

    ...sliceGroups,
    ...sliceCategories,
    ...sliceReceipts,
  },
});

export const csa = slice.actions;
