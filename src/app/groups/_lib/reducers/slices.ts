import { PayloadAction } from "@reduxjs/toolkit";

import { TGroup, TMembership } from "@/app/_lib/db";
import { insertAlphabetically } from "@/app/_lib/utils";
import { CombinedState as CS } from "@/app/_lib/reducers/types";

export const sliceGroups = {
  updateGroup(rs: CS, { payload }: PayloadAction<TGroup>) {
    const popFrom = rs.groups.findIndex(({ id }) => id === payload.id)!;
    rs.groups.splice(popFrom, 1);
    insertAlphabetically(payload, rs.groups);
  },

  addGroup(rs: CS, { payload }: PayloadAction<TGroup>) {
    insertAlphabetically(payload, rs.groups);
  },

  setGroupId(rs: CS, { payload }: PayloadAction<number>) {
    rs.groupId = payload;
  },

  setDefaultGroupId(rs: CS, { payload }: PayloadAction<number>) {
    rs.user!.defaultGroupId = payload;
  },

  updateMembership(rs: CS, { payload }: PayloadAction<TMembership>) {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships!.find((x) => x.user!.id === payload.userId!)!;

    ms.flags = payload.flags;
  },

  setUserColor(
    rs: CS,
    { payload: { color, uid } }: PayloadAction<{ color: string; uid?: number }>
  ) {
    const group = rs.groups.find((grp) => grp.id === rs.groupId)!;
    const user = (group.pareto ?? group.balance)!.users.find(
      (u) => u.id === uid
    )!;

    user.color = color;
  },
};
