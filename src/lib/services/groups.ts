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

      group.Memberships = Memberships.select("isAdmin", "statusId")
        .where({ groupId: group.id })
        .all();

      group.Users = Users.select()
        .innerJoin(Memberships.where({ groupId: group.id }))
        .all();

      return group;
    }
  );
}

export function addMember(group: TGroup, userId: number) {
  return atomic(
    { operation: "adding new member", revisedBy: userId },
    (rev) => {
      Groups.update({ uuid: null, id: group.id }, rev.id);

      return Memberships.insert(
        { userId, groupId: group.id },
        { revisionId: rev.id }
      );
    }
  );
}

export function joinGroup(uuid: string, userId: number) {
  return atomic(() => {
    const group = Groups.select().where({ statusId: 1, uuid }).get();

    if (!group) err("link expired");

    if (
      !!Memberships.select("groupId")
        .where({ statusId: 1, userId, groupId: group.id })
        .get()
    )
      err("already a member");

    return addMember(group, userId);
  });
}

export function getGroups(userId: number) {
  return atomic(() => {
    const groups = Groups.select()
      .innerJoin(Memberships.select("isAdmin").where({ userId, statusId: 1 }))
      .orderBy({
        col: "name",
        fn: "LOWER",
      })
      .all();

    const getUsers = Users.select()
      .innerJoin(Memberships.where({ statusId: 1, groupId: { $SQL: ":id" } }))
      .orderBy({ col: "name", fn: "LOWER" })
      .prepare().all;

    groups.forEach((group) => (group.Users = getUsers(group)));

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
