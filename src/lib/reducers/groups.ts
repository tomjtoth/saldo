import { PayloadAction } from "@reduxjs/toolkit";

import { AppDispatch, RootState } from "../store";
import { TGroup, TMembership } from "@/lib/db";
import { appToast, insertAlphabetically } from "../utils";
import { combinedSA as csa, CombinedState as CS } from ".";
import { svcSetChartStyle, svcUpdateMembership } from "../services/memberships";
import { svcGenerateInviteLink, svcRemoveInviteLink } from "../services/groups";

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

  updateMembership: (rs: CS, { payload }: PayloadAction<TMembership>) => {
    const group = rs.groups.find((grp) => grp.id === payload.groupId)!;
    const ms = group.memberships!.find((x) => x.user!.id === payload.userId!)!;

    ms.flags = payload.flags;
  },

  setMSChartStyle: (
    rs: CS,
    { payload: { style, uid } }: PayloadAction<{ style: string; uid?: number }>
  ) => {
    const group = rs.groups.find((grp) => grp.id === rs.groupId)!;
    const user = group.pareto!.users.find((u) => u.id === uid)!;

    user.chartStyle = style;
  },
};

export const tGroups = {
  updateGroup: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(csa.updateGroup(group));
  },

  addGroup: (group: TGroup) => (dispatch: AppDispatch) => {
    return dispatch(csa.addGroup(group));
  },

  generateInviteLink: (groupId: number) => (dispatch: AppDispatch) => {
    const crudOp = svcGenerateInviteLink(groupId).then((res) =>
      dispatch(csa.updateGroup(res))
    );

    appToast.promise(crudOp, "Generating invitation link");
  },

  removeInviteLink: (groupId: number) => (dispatch: AppDispatch) => {
    const crudOp = svcRemoveInviteLink(groupId).then((res) => {
      dispatch(csa.updateGroup(res));
    });

    appToast.promise(crudOp, "Deleting invitation link");
  },

  updateMembership:
    (groupId: number, userId: number, flags: number, toastMessage: string) =>
    (dispatch: AppDispatch) => {
      const crudOp = svcUpdateMembership({ groupId, userId, flags }).then(
        ({ flags }) => {
          dispatch(
            csa.updateMembership({
              groupId,
              userId,
              flags,
            })
          );
        }
      );

      appToast.promise(crudOp, toastMessage);

      return crudOp;
    },

  setGroupId: (groupId: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.setGroupId(groupId));
  },

  setDefaultGroupId: (groupId: number) => (dispatch: AppDispatch) => {
    return dispatch(csa.setDefaultGroupId(groupId));
  },

  setChartStyle:
    (style: string, uid?: number) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
      const rs = getState().combined;
      const prevState = rs.groups
        .find((g) => g.id === rs.groupId)!
        .pareto!.users.find((u) => u.id === uid)!.chartStyle;

      if (uid) {
        appToast.promise(
          svcSetChartStyle(rs.groupId!, uid, style).catch((err) => {
            dispatch(csa.setMSChartStyle({ style: prevState, uid }));
            throw err;
          }),
          "updating Chart config"
        );
      }

      return dispatch(csa.setMSChartStyle({ style, uid }));
    },
};
