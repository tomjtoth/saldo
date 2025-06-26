import { col, fn, IncludeOptions } from "sequelize";

import {
  atomic,
  Category,
  Group,
  Item,
  Membership,
  Receipt,
  ReceiptArchive,
  Revision,
  TItem,
  User,
} from "../models";

export type TReceiptInput = {
  groupId: number;
  paidOn?: number;
  paidBy?: number;
  items: TItem[];
};

export async function addReceipt(addedBy: number, data: TReceiptInput) {
  return await atomic("Adding receipt", async (transaction) => {
    const rev = await Revision.create({ revBy: addedBy }, { transaction });

    const rcpt = await Receipt.create(
      {
        groupId: data.groupId,
        revId: rev.id,
        paidOn: data.paidOn,
        paidBy: data.paidBy ?? addedBy,
      },
      { transaction }
    );

    const items = await Item.bulkCreate(
      data.items.map((i) => ({ ...i, revId: rev.id, rcptId: rcpt.id })),
      { transaction }
    );

    return { rev, rcpt, items };
  });
}

export async function getReceiptsDataFor(userId: number, offset = 0) {
  return await Group.findAll({
    include: [
      {
        model: Membership,
        attributes: ["defaultCatId"],
        where: { userId, statusId: 1 },
      },
      {
        model: User,
        attributes: ["id", "name", "email", "image"],
        through: { where: { statusId: 1 } },
      },
      { model: Category, attributes: ["id", "name"], where: { statusId: 1 } },
      {
        model: Receipt,
        separate: true,
        limit: 50,
        offset,
        include: [
          {
            model: Revision,
            attributes: ["revOn"],
            include: [{ model: User, attributes: ["name"] }],
          },
          {
            model: ReceiptArchive,
            as: "archives",
            include: [
              {
                model: Revision,
                attributes: ["revOn"],
                include: [{ model: User, attributes: ["name"] }],
              },
            ],
          },
          Item,
        ],
        order: [["revId", "DESC"]],
      } as IncludeOptions,
    ],
    order: [
      fn("LOWER", col("Group.name")),
      fn("LOWER", col("Categories.name")),
    ],
  });
}
