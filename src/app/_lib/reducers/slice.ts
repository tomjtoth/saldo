import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { sliceCategories } from "../../categories/_lib/reducers";
import { sliceGroups } from "../../groups/_lib/reducers";
import { sliceReceipts } from "../../receipts/_lib/reducers";
import { CombinedState } from "./types";

export const slice = createSlice({
  name: "combined",
  initialState: { groups: [] } as CombinedState,

  reducers: {
    init(rs, { payload }: PayloadAction<CombinedState>) {
      rs.user = payload.user;

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
