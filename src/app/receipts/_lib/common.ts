export const RECEIPT_COLS_WITH = {
  with: {
    revision: {
      columns: {
        createdAt: true,
      },
      with: {
        createdBy: { columns: { id: true, image: true, name: true } },
      },
    },
    items: {
      with: {
        itemShares: true as const,
      },
    },
    paidBy: { columns: { id: true, image: true, name: true } },
  },
};
