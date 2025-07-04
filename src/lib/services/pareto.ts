import { DateTime } from "luxon";
import { QueryTypes } from "sequelize";

import { Category, db, User } from "../models";
import { dateToInt, EUROPE_HELSINKI } from "../utils";
import { TParetoChartData } from "@/components/pareto/chart";

export async function getParetoDataFor(
  userId: number,
  opts: {
    from?: string;
    to?: string;
  } = {}
) {
  const dateCrit: string[] = [];
  const replacements = [userId];

  if (opts.from && DateTime.fromISO(opts.from, EUROPE_HELSINKI).isValid) {
    replacements.push(dateToInt(opts.from));
    dateCrit.push("AND paidOn > ?");
  }

  if (opts.to && DateTime.fromISO(opts.to, EUROPE_HELSINKI).isValid) {
    replacements.push(dateToInt(opts.to));
    dateCrit.push("AND paidOn < ?");
  }

  const rows: {
    groupId: number;
    catId: number;
    uid: number;
    total: number;
  }[] = await db.query(
    `SELECT groupId, catId, paidTo AS uid, SUM(share) as total
     FROM memberships ms
     INNER JOIN consumption c ON ms.group_id = c.groupId
     WHERE ms.user_id = ? ${dateCrit.join(" ")}
     GROUP BY groupId, uid, catId`,

    { type: QueryTypes.SELECT, replacements }
  );

  const buffer: {
    [groupId: number]: {
      [catId: number]: {
        [consumer: number]: number;
      };
    };
  } = {};

  // TODO: replace this post-processing with a professional sequelize query
  rows.forEach(({ groupId, catId, uid, total }) => {
    if (!buffer[groupId]) buffer[groupId] = {};
    const group = buffer[groupId];

    if (!group[catId]) group[catId] = {};
    const cat = group[catId];

    cat[uid] = total;
  });

  const cats = await Category.findAll({ attributes: ["id", "name"] });
  const users = await User.findAll({ attributes: ["id", "name"] });

  const data = Object.fromEntries(
    Object.entries(buffer).map(([groupId, catVals]) => {
      const nameBuffer: { [uid: number]: string } = {};

      const categories = Object.entries(catVals).map(([catId, consumers]) => {
        let __sum = 0;

        const rest = Object.fromEntries(
          Object.entries(consumers).map(([uid, val]) => {
            const idAsNum = Number(uid);
            if (!nameBuffer[idAsNum])
              nameBuffer[idAsNum] = users.find(
                (u) => u.id === Number(uid)
              )!.name;

            __sum += val;
            return [nameBuffer[idAsNum], val];
          })
        );

        return {
          category: cats.find((cat) => cat.id === Number(catId))!.name,
          __sum,
          ...rest,
        };
      });

      categories.sort((a, b) => b.__sum - a.__sum);

      return [
        Number(groupId),
        {
          names: Object.values(nameBuffer),
          categories,
        } as TParetoChartData,
      ];
    })
  );

  return {
    from: opts.from,
    to: opts.to,
    data,
  };
}
