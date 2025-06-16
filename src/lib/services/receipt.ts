import { Op } from "sequelize";

import {
  atomic,
  Item,
  Receipt,
  ReceiptArchive,
  Revision,
  TItem,
  User,
} from "../models";

export type TReceiptInput = {
  paidOn?: number;
  paidBy?: number;
  items: TItem[];
};

export async function addReceipt(addedBy: number, data: TReceiptInput) {
  return await atomic("Adding receipt", async (transaction) => {
    const rev = await Revision.create({ revBy: addedBy }, { transaction });

    const rcpt = await Receipt.create(
      {
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

export async function getReceiptsOf(userId: number) {
  return Receipt.findAll({
    order: [["paidOn", "DESC"]],
    include: [
      { model: Item, attributes: ["cost"] },
      {
        model: Revision,
        // TODO: get all partners of user
        where: { revBy: { [Op.in]: [userId] } },
        include: [User],
      },
      {
        model: ReceiptArchive,
        as: "archives",
        separate: true,
        include: [{ model: Revision, include: [User] }],
        limit: 1,
      },
    ],
    limit: 200,
  });
}
