import { QueryTypes } from "sequelize";

import { db, User } from "@/lib/models";
import { TBalanceChartData } from "@/components/balance/chart";

type TRelation = {
  name: string;
  temp: number;
};

export async function getBalanceDataFor(userId: number) {
  const rows: {
    groupId: number;
    date: number;
    uid1: number;
    uid2: number;
    share: number;
  }[] = await db.query(
    `SELECT
      groupId,
      paidOn AS date,
      paidBy AS uid1,
      paidTo AS uid2,
      SUM(share) as share
    FROM memberships ms
    INNER JOIN consumption c ON ms.group_id = c.groupId
    WHERE ms.user_id = ? AND paidBy != paidTo
    GROUP BY groupId, paidOn, paidBy, paidTo
    ORDER BY groupId, date`,

    { type: QueryTypes.SELECT, replacements: [userId] }
  );

  const users = await User.findAll({ attributes: ["id", "name"] });

  const dataBuffer: {
    [groupId: number]: {
      relations: {
        [uid1: number]: {
          [uid2: number]: TRelation;
        };
      };
      data: {
        [date: number]: {
          [relation: string]: number;
        };
      };
    };
  } = {};

  // TODO: replace this post-processing with a professional sequelize query
  rows.forEach(({ groupId, date, uid1, uid2, share }) => {
    if (!dataBuffer[groupId]) dataBuffer[groupId] = { relations: {}, data: {} };
    const group = dataBuffer[groupId];

    let isDir12 = false;
    let relation: TRelation;

    if (!!group.relations[uid2] && !!group.relations[uid2][uid1]) {
      relation = group.relations[uid2][uid1];
    } else {
      isDir12 = true;
      let loading = true;

      if (!group.relations[uid1]) {
        group.relations[uid1] = {};
        loading = false;
      }

      if (!group.relations[uid1][uid2]) {
        relation = {
          temp: 0,
          name: `${users.find((u) => u.id == Number(uid1))!.name} vs ${
            users.find((u) => u.id == Number(uid2))!.name
          }`,
        };
        group.relations[uid1][uid2] = relation;
        loading = false;
      }

      if (loading) relation = group.relations[uid1][uid2];
    }
    relation = relation!;

    if (!group.data[date]) group.data[date] = {};

    group.data[date][relation.name] =
      relation.temp + (isDir12 ? 1 : -1) * share;
    relation.temp = group.data[date][relation.name];
  });

  return Object.fromEntries(
    Object.entries(dataBuffer).map(([groupId, { data, relations }]) => [
      groupId,
      {
        relations: Object.values(relations).reduce((all, uid1vals) => {
          Object.values(uid1vals).forEach(({ name }) => {
            all.push(name);
          });

          return all;
        }, [] as string[]),
        data: Object.entries(data).map(([date, relations]) => ({
          date: Number(date),
          ...relations,
        })),
      } as TBalanceChartData,
    ])
  );
}
