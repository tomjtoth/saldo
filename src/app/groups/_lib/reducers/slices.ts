import { PayloadAction } from "@reduxjs/toolkit";

import { User } from "@/app/(users)/_lib";
import { Group } from "../getGroups";
import { insertAlphabetically } from "@/app/_lib/utils";
import { CombinedState as CS } from "@/app/_lib/reducers/types";
import { MembershipModifier } from "@/app/(memberships)/_lib";

export const sliceGroups = {
  modGroup(rs: CS, { payload }: PayloadAction<Group>) {
    const popFrom = rs.groups.findIndex(({ id }) => id === payload.id);
    rs.groups.splice(popFrom, 1);
    insertAlphabetically(payload, rs.groups);
  },

  addGroup(rs: CS, { payload }: PayloadAction<Group>) {
    insertAlphabetically(payload, rs.groups);
  },

  setGroupId(rs: CS, { payload }: PayloadAction<Group["id"]>) {
    rs.groupId = payload;
  },

  setDefaultGroupId(rs: CS, { payload }: PayloadAction<Group["id"]>) {
    rs.user!.defaultGroupId = payload;
  },

  modMembership(rs: CS, { payload }: PayloadAction<MembershipModifier>) {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships.find((x) => x.user.id === payload.userId)!;

    ms.flags = payload.flags;
  },

  setUserColor(
    rs: CS,
    {
      payload: { color, uid },
    }: PayloadAction<{ color: User["color"]; uid?: User["id"] }>
  ) {
    const group = rs.groups.find((grp) => grp.id === rs.groupId)!;
    const user = uid ? group.users.find((u) => u.id === uid) : rs.user;

    user!.color = color;
  },
};
