import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup, TItem, TReceipt, TUser } from "@/lib/db";
import { rCategories, tCategories } from "./categories";
import { rGroups, tGroups } from "./groups";
import { addEmptyReceipts, rReceipts, tReceipts } from "./receipts";

export * from "./receipts";

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

const slice = createSlice({
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

    ...rGroups,
    ...rCategories,
    ...rReceipts,
  },
});

export const combinedSA = slice.actions;

export const rCombined = {
  init: (data: Initializer) => (dispatch: AppDispatch) => {
    addEmptyReceipts(data);
    return dispatch(combinedSA.init(data));
  },

  ...tGroups,
  ...tCategories,
  ...tReceipts,
};

export default slice.reducer;
