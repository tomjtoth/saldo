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
      return appToast.promise(`Updating "${original.name}"`, async () => {
        be.stringWith3ConsecutiveLetters(modifiers.name, "name");

        apiModGroup({ id: groupId, ...modifiers }).then((res) => {
          const ops = appToast.opsDone(original, res);
          dispatch(csa.modGroup(res));

          return `${ops} "${original.name}" succeeded!`;
        });
      });
    },

  addGroup:
    ({ name, description }: Group) =>
    (dispatch: AppDispatch) => {
      return appToast.promise(`Saving "${name}" to db`, async () => {
        be.stringWith3ConsecutiveLetters(name, "name");

        apiAddGroup({ name, description }).then((res) => {
          dispatch(csa.addGroup(res));
        });
      });
    },

  generateInviteLink: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    appToast.promise(
      "Generating invitation link",

      apiGenInviteLink(groupId).then((res) => {
        dispatch(csa.modGroup(res));
      })
    );
  },

  removeInviteLink: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    appToast.promise(
      "Deleting invitation link",

      apiRmInviteLink(groupId).then((res) => {
        dispatch(csa.modGroup(res));
      })
    );
  },

  modMembership:
    ({ groupId, userId, flags }: MembershipModifier, toastMessage: string) =>
    (dispatch: AppDispatch) => {
      return appToast.promise(
        toastMessage,

        apiModMembership({ groupId, userId, flags }).then(({ flags }) => {
          dispatch(
            csa.modMembership({
              groupId,
              userId,
              flags,
            })
          );
        })
      );
    },

  setGroupId: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    return dispatch(csa.setGroupId(groupId));
  },

  setDefaultGroupId: (groupId: Group["id"]) => (dispatch: AppDispatch) => {
    return appToast.promise(
      "Setting default group",

      apiSetDefaultGroup(groupId).then(() => {
        dispatch(csa.setDefaultGroupId(groupId));
      })
    );
  },

  setUserColor:
    (color: User["color"] | null, uid?: User["id"]) =>
    async (dispatch: AppDispatch, getState: RootStateGetter) => {
      const rs = getState().combined;
      const group = rs.groups.find((g) => g.id === rs.groupId)!;
      const prevState = uid
        ? group.users.find((u) => u.id === uid)!.color
        : rs.user!.color;

      appToast
        .promise(
          `${color ? "updating" : "resetting"} ${
            uid ? "color of member" : "chart color"
          }`,

          apiSetUserColor({
            color,
            ...(uid
              ? {
                  groupId: rs.groupId,
                  memberId: uid,
                }
              : {}),
          })
        )
        .catch(() => {
          dispatch(csa.setUserColor({ color: prevState, uid }));
        });

      if (color) return dispatch(csa.setUserColor({ color, uid }));
    },
};
