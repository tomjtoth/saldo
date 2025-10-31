import { PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import { AppDispatch, RootState } from "../store";
import { TGroup, TMembership } from "@/app/_lib/db";
import {
  appToast,
  has3ConsecutiveLetters,
  insertAlphabetically,
} from "../utils";
import { combinedSA as csa, CombinedState as CS } from ".";
import { svcSetUserColor, svcUpdateMembership } from "../services/memberships";
import {
  svcCreateGroup,
  svcGenerateInviteLink,
  svcRemoveInviteLink,
  svcSetDefaultGroup,
  svcUpdateGroup,
} from "../services/groups";

export const rGroups = {
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

export const tGroups = {
  updateGroup:
    (groupId: number, modifiers: TGroup, original: TGroup) =>
    (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(modifiers.name!);
      } catch (err) {
        toast.error((err as Error).message as string, appToast.theme());
        throw err;
      }

      const crudOps = svcUpdateGroup(groupId, modifiers).then((res) => {
        const ops = appToast.opsDone(original, res);
        dispatch(csa.updateGroup(res));

        return `${ops} "${original.name}" succeeded!`;
      });

      appToast.promise(crudOps, `Updating "${original.name}"`);

      return crudOps;
    },

  addGroup:
    ({ name, description }: TGroup) =>
    (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(name!);
      } catch (err) {
        toast.error((err as Error).message as string, appToast.theme());
      }

      const crudOp = svcCreateGroup(name!, description!).then((res) => {
        dispatch(csa.addGroup(res));
      });
      appToast.promise(crudOp, `Saving "${name}" to db`);

      return crudOp;
    },

  generateInviteLink: (groupId: number) => (dispatch: AppDispatch) => {
    const crudOp = svcGenerateInviteLink(groupId).then((res) => {
      dispatch(csa.updateGroup(res));
    });

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
    const crudOp = svcSetDefaultGroup(groupId).then(() => {
      dispatch(csa.setDefaultGroupId(groupId));
    });

    appToast.promise(crudOp, "Setting default group");

    return crudOp;
  },

  setUserColor:
    (color: string, uid?: number) =>
    async (dispatch: AppDispatch, getState: () => RootState) => {
      const rs = getState().combined;
      const group = rs.groups.find((g) => g.id === rs.groupId)!;
      const prevState = (group.pareto ?? group.balance)!.users.find(
        (u) => u.id === uid
      )!.color;

      if (uid) {
        appToast.promise(
          svcSetUserColor(color, rs.groupId, uid).catch((err) => {
            dispatch(csa.setUserColor({ color: prevState, uid }));
            throw err;
          }),
          "updating color of member"
        );
      }

      return dispatch(csa.setUserColor({ color, uid }));
    },
};
