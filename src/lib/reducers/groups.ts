import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch } from "../store";
import { TGroup, TMembership } from "../models";
import { insertAlphabetically } from "../utils";
import { combinedSA as sa, CombinedState } from ".";

export const rGroups = {
  updateGroup: (rs: CombinedState, { payload }: PayloadAction<TGroup>) => {
    const popFrom = rs.groups.findIndex(({ id }) => id === payload.id)!;
    rs.groups.splice(popFrom, 1);
    insertAlphabetically(payload, rs.groups);
  },

  addGroup: (rs: CombinedState, { payload }: PayloadAction<TGroup>) => {
    insertAlphabetically(payload, rs.groups);
  },

  updateMS: (rs: CombinedState, { payload }: PayloadAction<TMembership>) => {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const user = group.Users!.find((user) => user.id === payload.userId)!;
    const ms = user.Membership!;

    ms.admin = payload.admin;
    ms.statusId = payload.statusId;
  },
};

export const tGroups = {
  updateGroup: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(sa.updateGroup(group));
  },

  addGroup: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(sa.addGroup(group));
  },

  updateMS: (ms: TMembership) => (dispatch: AppDispatch) => {
    return dispatch(sa.updateMS(ms));
  },
};
