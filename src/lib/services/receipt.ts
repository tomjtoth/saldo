import { atomic, Item, Receipt, Revision, TCrItem } from "../models";

export type TReceiptInput = {
  paidOn?: number;
  paidBy?: number;
  items: (TCrItem & { shares?: { userId: number; share: number }[] })[];
};

export async function addReceipt(addedBy: number, data: TReceiptInput) {
  if (data.items.length === 0) return;

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

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const items = await Item.bulkCreate(
      data.items.map((i) => ({ ...i, rcptId: rcpt.id })),
      { transaction }
    );
  });
}
