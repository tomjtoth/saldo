import { atomic, Item, Receipt, Revision, TCliItem } from "../models";

export type TReceiptInput = {
  paidOn?: number;
  paidBy?: number;
  items: TCliItem[];
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
