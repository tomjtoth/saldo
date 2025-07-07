import { col, fn, IncludeOptions, Op } from "sequelize";

import {
  atomic,
  Category,
  Group,
  Item,
  ItemShare,
  Membership,
  Receipt,
  ReceiptArchive,
  Revision,
  TCrItemShare,
  User,
} from "../models";
import { TCliReceipt } from "../reducers";

export type TReceiptInput = TCliReceipt & { groupId: number };

const RCPT_INCLUDE = {
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
    { model: User, attributes: ["name"] },
  ],
};

export async function addReceipt(addedBy: number, data: TReceiptInput) {
  return await atomic("Adding receipt", async (transaction) => {
    const rev = await Revision.create({ revBy: addedBy }, { transaction });

    const rcpt = await Receipt.create(
      {
        groupId: data.groupId,
        revId: rev.id,
        paidOn: data.paidOn,
        paidBy: data.paidBy,
      },
      { transaction }
    );

    const items = await Item.bulkCreate(
      data.items.map((i) => ({
        revId: rev.id,
        rcptId: rcpt.id,
        catId: i.catId,
        cost: parseFloat(i.cost),
        notes: i.notes == "" ? undefined : i.notes,
      })),
      { transaction }
    );

    // this relies on Sequelize returning the items in exactly the same order as inserted
    const itemSharesToSave = data.items.reduce((shares, item, idx) => {
      Object.entries(item.shares).forEach(([strUserId, strShare]) => {
        const userId = Number(strUserId);
        const share = Number(strShare);

        if (!isNaN(userId) && !isNaN(share) && share > 0) {
          shares.push({
            revId: rev.id,
            userId,
            itemId: items[idx].id,
            share,
          });
        }
      });
      return shares;
    }, [] as TCrItemShare[]);

    await ItemShare.bulkCreate(itemSharesToSave, { transaction });

    return await rcpt.reload({ ...RCPT_INCLUDE, transaction });
  });
}

export async function getReceiptsDataFor(
  userId: number,
  knownIds: number[] = []
) {
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
        through: { where: { statusId: 1 }, attributes: [] },
      },
      { model: Category, attributes: ["id", "name"], where: { statusId: 1 } },
      {
        model: Receipt,
        separate: true,
        limit: 50,
        where: { id: { [Op.not]: knownIds } },
        ...RCPT_INCLUDE,
        order: [["paidOn", "DESC"]],
      } as IncludeOptions,
    ],
    order: [
      fn("LOWER", col("Group.name")),
      fn("LOWER", col("Categories.name")),
    ],
  });
}
