import { atomic, db } from "../db";
import { Categories, Groups, TCategory, TCrCategory, Users } from "../models";
import { Revisions } from "../models/revision";

export type TCategoryUpdater = Partial<
  Pick<TCategory, "name" | "description" | "statusId">
>;

export function createCategory(revisedBy: number, data: TCrCategory) {
  return atomic({ operation: "Creating category", revisedBy }, (rev) => {
    const [cat] = Categories.insert(data);

    cat.Revision = rev;
    cat.Revision.User = Users.get(
      `SELECT name FROM users WHERE id = :revisedBy`,
      { revisedBy }
    )!;
    cat.Archives = [];

    return cat;
  });
}

export function updateCategory(
  categoryId: number,
  revisedBy: number,
  updater: TCategoryUpdater
) {
  return atomic({ operation: "Updating category", revisedBy }, (rev) => {
    const cat = Categories.update!({ ...updater, id: categoryId }, rev.id);

    cat.Archives = Categories.archives(cat);

    const getRevOn = Revisions.get(
      "SELECT revisedOn FROM revisions WHERE id = :revisionId"
    );
    cat.Revision = getRevOn(cat)!;
    cat.Archives.forEach((cat) => (cat.Revision = getRevOn(cat)!));

    const getUsername = Users.get(`
      SELECT name FROM revisions r
      INNER JOIN users u ON (r.revisedBy = u.id)
      WHERE r.id = :revisionId`);

    cat.Revision.User = getUsername(cat)!;
    cat.Archives.forEach((cat) => (cat.Revision!.User = getUsername(cat)!));

    return cat;
  });
}

export function userAccessToCat(userId: number, categoryId: number) {
  return !!db
    .prepare(
      `SELECT 1 FROM categories c 
      INNER JOIN memberships ms ON (
        ms.groupId = c.groupId AND
        ms.userId = :userId AND
        ms.statusId = 1
      )
      WHERE c.id = :categoryId`
    )
    .pluck()
    .get({ userId, categoryId });
}

export function getCategories(userId: number) {
  return db.transaction(() => {
    const groups = Groups.all<{
      defaultCategoryId: number;
    }>(
      `SELECT 
          g.id, g.name, 
          ms.defaultCategoryId AS "memberships.defaultCategoryId"
        FROM groups g
        INNER JOIN memberships ms ON (
          ms.groupId = g.id AND
          ms.userId = :userId AND
          ms.statusId = 1
        )
        WHERE g.statusId = 1
        ORDER BY g.name`,
      { userId }
    );

    const allUsers = Users.all(
      `SELECT u.id, u.name FROM memberships ms 
      INNER JOIN users u ON (
        ms.userId = u.id AND
        ms.statusId = 1
      )
      WHERE ms.groupId = :id`
    );

    groups.forEach((group) => {
      group.Users = allUsers(group);
    });

    const allCats = Categories.all(
      `SELECT * FROM categories
      WHERE groupId = :id
      AND statusId IN (1, 2)`
    );

    groups.forEach((group) => {
      group.Categories = allCats(group);
    });

    const arcihvedCats = Categories.archives;

    groups.forEach((group) => {
      group.Categories!.forEach((cat) => {
        cat.Archives = arcihvedCats(cat);
      });
    });

    const getRevOn = Revisions.get(
      "SELECT revisedOn FROM revisions WHERE id = ?"
    );

    groups.forEach((group) => {
      group.Categories!.forEach((cat) => {
        cat.Revision = getRevOn(cat.revisionId)!;
        cat.Archives!.forEach(
          (cat) => (cat.Revision = getRevOn(cat.revisionId)!)
        );
      });
    });

    const getUsername = Users.get(
      `SELECT u.name FROM users u
      INNER JOIN revisions r ON (r.revisedBy = u.userId)
      WHERE categoryId = :id
      ORDER BY r.revisedOn DESC`
    );

    groups.forEach((group) => {
      group.Categories!.forEach((cat) => {
        cat.Revision!.User = getUsername(cat)!;
        cat.Archives!.forEach(
          (cat) => (cat.Revision!.User = getUsername(cat)!)
        );
      });
    });

    return groups;
  })();
}
