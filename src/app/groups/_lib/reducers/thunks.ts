import { toast } from "react-toastify";

import { AppDispatch, RootStateGetter } from "@/app/_lib/store";
import { appToast, be } from "@/app/_lib/utils";
import {
  apiAddGroup,
  apiGenInviteLink,
  apiRmInviteLink,
  apiSetDefaultGroup,
  apiModGroup,
  Group,
} from "..";
import {
  apiSetUserColor,
  apiModMembership,
  MembershipModifier,
} from "@/app/(memberships)/_lib";
import { csa } from "@/app/_lib/reducers/slice";
import { User } from "@/app/(users)/_lib";

export const thunksGroups = {
  modGroup:
    (
      groupId: number,
      modifiers: Pick<Group, "name" | "description" | "flags">,
      original: Group
    ) =>
    (dispatch: AppDispatch) => {
      try {
        be.stringWith3ConsecutiveLetters(modifiers.name, "name");

        const crudOps = apiModGroup({ id: groupId, ...modifiers }).then(
          (res) => {
            const ops = appToast.opsDone(original, res);
            dispatch(csa.modGroup(res));

            return `${ops} "${original.name}" succeeded!`;
          }
        );

        appToast.promise(crudOps, `Updating "${original.name}"`);

        return crudOps;
      } catch (err) {
        toast.error((err as Error).message as string, appToast.theme());
      }
    },

  addGroup:
    ({ name, description }: Group) =>
    (dispatch: AppDispatch) => {
      try {
        be.stringWith3ConsecutiveLetters(name, "name");

        const op = apiAddGroup({ name, description }).then((res) => {
          dispatch(csa.addGroup(res));
        });

        appToast.promise(op, `Saving "${name}" to db`);

        return op;
      } catch (err) {
        toast.error((err as Error).message as string, appToast.theme());
      }
    },

  generateInviteLink: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    const crudOp = apiGenInviteLink(groupId).then((res) => {
      dispatch(csa.modGroup(res));
    });

    appToast.promise(crudOp, "Generating invitation link");
  },

  removeInviteLink: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    const crudOp = apiRmInviteLink(groupId).then((res) => {
      dispatch(csa.modGroup(res));
    });

    appToast.promise(crudOp, "Deleting invitation link");
  },

  modMembership:
    ({ groupId, userId, flags }: MembershipModifier, toastMessage: string) =>
    (dispatch: AppDispatch) => {
      const crudOp = apiModMembership({ groupId, userId, flags }).then(
        ({ flags }) => {
          dispatch(
            csa.modMembership({
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

  setGroupId: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.setGroupId(groupId));
  },

  setDefaultGroupId: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    const crudOp = apiSetDefaultGroup(groupId).then(() => {
      dispatch(csa.setDefaultGroupId(groupId));
    });

    appToast.promise(crudOp, "Setting default group");

    return crudOp;
  },

  setUserColor:
    (color: User["color"] | null, uid?: User["id"]) =>
    async (dispatch: AppDispatch, getState: RootStateGetter) => {
      const rs = getState().combined;
      const group = rs.groups.find((g) => g.id === rs.groupId)!;
      const prevState = uid
        ? group.users.find((u) => u.id === uid)!.color
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
          dispatch(csa.setUserColor({ color: prevState, uid }));
          throw err;
        }),

        `${color ? "updating" : "resetting"} ${
          uid ? "color of member" : "chart color"
        }`
      );

      if (color) return dispatch(csa.setUserColor({ color, uid }));
    },
};
