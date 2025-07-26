import { atomic } from "../db";
import {
  Groups,
  Memberships,
  Revisions,
  TCrGroup,
  TGroup,
  Users,
} from "../models";
import { err } from "../utils";

export async function createGroup(
  revisedBy: number,
  data: Pick<TCrGroup, "id" | "name" | "description">
) {
  return atomic(
    { operation: "creating new group", revisedBy },
    ({ id: revisionId }) => {
      const [group] = Groups.insert(data, { revisionId });

      Memberships.insert(
        {
          groupId: group.id,
          userId: revisedBy,
          isAdmin: true,
        },
        { revisionId }
      );

      return (
        Groups.innerJoin(Memberships.select("statusId", "isAdmin"))
          .innerJoin(Users.andFrom(Memberships.select("statusId", "isAdmin")))

          // TODO: make this compatible
          .innerJoin(Revisions)
          .all(0)
      );
    }
  );
}

export function addMember(groupId: number, userId: number) {
  return atomic(
    { operation: "adding new member", revisedBy: userId },
    (rev) => {
      const group = Groups.where({ id: groupId, statusId: 1 }).get()!;

      Groups.update({ uuid: null, id: group.id }, rev.id);

      return Memberships.insert({ userId, groupId }, { revisionId: rev.id });
    }
  );
}

export function joinGroup(uuid: string, userId: number) {
  return atomic(() => {
    const group = Groups.get(
      "SELECT * FROM groups WHERE uuid = ? AND statusId = 1",
      uuid
    );

    if (!group) err("link expired");

    if (
      !!Memberships.get(
        `SELECT * FROM memberships WHERE statusId IN (1, 2)
        AND userId = ? AND groupId = ?`,
        userId,
        group.id
      )
    )
      err("already a member");

    return addMember(group.id, userId);
  });
}

export function getGroups(userId: number) {
  return atomic(() => {
    const groups = Groups.innerJoin(Memberships.where({ userId })).orderBy({
      col: "name",
      fn: "LOWER",
    });

    Groups.all(
      `SELECT g.* FROM groups g INNER JOIN memberships ms ON (
        g.id = ms.groupId AND ms.userId = ?
      )
      ORDER BY g.name`,
      userId
    );

    const getUsers = Users.innerJoin(
      Memberships.where({ statusId: 1, groupId: { $SQL: ":id" } })
    ).orderBy({ col: "name", fn: "LOWER" }).all;

    groups.forEach((group) => (group.Users = getUsers(group)));

    Memberships.select("isAdmin", "statusId").where({
      groupId: { $SQL: ":groupId" },
      userId: { $SQL: ":userId" },
    }).get;

    const get2FromMemberships = Memberships.get(
      "SELECT admin, statusId FROM memberships WHERE groupId = :id AND userId = ?"
    );

    groups.forEach((group) =>
      group.Users!.forEach((u) => get2FromMemberships(u.id, group))
    );

    return groups;
  });
}

export type GroupUpdater = Pick<TGroup, "id"> &
  Partial<Pick<TGroup, "name" | "description" | "statusId" | "uuid">>;

export function updateGroup(revisedBy: number, updater: GroupUpdater) {
  return atomic({ operation: "Updating group", revisedBy }, ({ id: revId }) => {
    const group = Groups.update(updater, revId);

    group.Memberships = Memberships.all(
      `SELECT * FROM memberships WHERE groupId = :id
      AND userId = ? AND statusId IN (1, 2)`,
      revisedBy,
      group
    );

    group.Users = Users.all(
      `SELECT u.* FROM users u 
      INNER JOIN memberships ms ON (
        ms.groupId = :id AND ms.statusId = 1
      )
      ORDER BY LOWER(u.name)`,
      group
    );

    const get2FromMemberships = Memberships.get(
      "SELECT admin, statusId FROM memberships WHERE groupId = :id AND userId = ?"
    );

    group.Users.forEach((u) => get2FromMemberships(u.id, group));

    return group;
  });
}
