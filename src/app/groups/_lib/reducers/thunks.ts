import { toast } from "react-toastify";

import { AppDispatch, RootStateGetter } from "@/app/_lib/store";
import { TGroup } from "@/app/_lib/db";
import { appToast, has3ConsecutiveLetters } from "@/app/_lib/utils";
import {
  apiAddGroup,
  apiGenInviteLink,
  apiRmInviteLink,
  apiSetDefaultGroup,
  apiModGroup,
} from "..";
import { apiSetUserColor, apiModMembership } from "@/app/(memberships)/_lib";
import { csa } from "@/app/_lib/reducers/slice";

export const thunksGroups = {
  updateGroup:
    (groupId: number, modifiers: TGroup, original: TGroup) =>
    (dispatch: AppDispatch) => {
      try {
        has3ConsecutiveLetters(modifiers.name!);
      } catch (err) {
        toast.error((err as Error).message as string, appToast.theme());
        throw err;
      }

      const crudOps = apiModGroup({ id: groupId, ...modifiers }).then((res) => {
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

      const crudOp = apiAddGroup({ name: name!, description }).then((res) => {
        dispatch(csa.addGroup(res));
      });
      appToast.promise(crudOp, `Saving "${name}" to db`);

      return crudOp;
    },

  generateInviteLink: (groupId: number) => (dispatch: AppDispatch) => {
    const crudOp = apiGenInviteLink({ id: groupId }).then((res) => {
      dispatch(csa.updateGroup(res));
    });

    appToast.promise(crudOp, "Generating invitation link");
  },

  removeInviteLink: (groupId: number) => (dispatch: AppDispatch) => {
    const crudOp = apiRmInviteLink({ id: groupId }).then((res) => {
      dispatch(csa.updateGroup(res));
    });

    appToast.promise(crudOp, "Deleting invitation link");
  },

  updateMembership:
    (groupId: number, userId: number, flags: number, toastMessage: string) =>
    (dispatch: AppDispatch) => {
      const crudOp = apiModMembership({ groupId, userId, flags }).then(
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
    const crudOp = apiSetDefaultGroup(groupId).then(() => {
      dispatch(csa.setDefaultGroupId(groupId));
    });

    appToast.promise(crudOp, "Setting default group");

    return crudOp;
  },

  setUserColor:
    (color: string | null, uid?: number) =>
    async (dispatch: AppDispatch, getState: RootStateGetter) => {
      const rs = getState().combined;
      const group = rs.groups.find((g) => g.id === rs.groupId)!;
      const prevState = uid
        ? (group.pareto ?? group.balance)!.users.find((u) => u.id === uid)!
            .color
        : rs.user!.color;

      appToast.promise(
        apiSetUserColor({
          color,
          ...(uid
            ? {
                groupId: rs.groupId,
                memberId: uid,
              }
            : {}),
        }).catch((err) => {
          dispatch(csa.setUserColor({ color: prevState!, uid }));
          throw err;
        }),

        `${color ? "updating" : "resetting"} ${
          uid ? "color of member" : "chart color"
        }`
      );

      if (color) return dispatch(csa.setUserColor({ color, uid }));
    },
};
