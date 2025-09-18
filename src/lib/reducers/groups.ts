import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup, TMembership } from "@/lib/db";
import { insertAlphabetically } from "../utils";
import { combinedSA as csa, CombinedState as CS } from ".";

export const rGroups = {
  updateGroup: (rs: CS, { payload }: PayloadAction<TGroup>) => {
    const popFrom = rs.groups.findIndex(({ id }) => id === payload.id)!;
    rs.groups.splice(popFrom, 1);
    insertAlphabetically(payload, rs.groups);
  },

  addGroup: (rs: CS, { payload }: PayloadAction<TGroup>) => {
    insertAlphabetically(payload, rs.groups);
  },

  setGroupId: (rs: CS, { payload }: PayloadAction<number>) => {
    rs.groupId = payload;
  },

  setDefaultGroupId: (rs: CS, { payload }: PayloadAction<number>) => {
    rs.defaultGroupId = payload;
  },

  updateMS: (rs: CS, { payload }: PayloadAction<TMembership>) => {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships!.find((x) => x.user!.id === payload.userId!)!;

    ms.flags = payload.flags;
  },
};

export const tGroups = {
  updateGroup: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(csa.updateGroup(group));
  },

  addGroup: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(csa.addGroup(group));
  },

  updateMS: (ms: TMembership) => (dispatch: AppDispatch) => {
    return dispatch(csa.updateMS(ms));
  },

  setGroupId: (groupId: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.setGroupId(groupId));
  },

  setDefaultGroupId: (groupId: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.setDefaultGroupId(groupId));
  },
};
