import { TGroup, TItem } from "@/app/_lib/db";
import { VDate } from "@/app/_lib/utils";
import { CombinedState as CS, Initializer } from "@/app/_lib/reducers/types";

// this provides the key prop to React during `items.map( ... )`
// TODO: enable drag n drop re-arrangement of items in adder
let rowId = 0;
export const addItem = (categoryId: number) => ({
  id: --rowId,
  categoryId,
  cost: "",
  notes: "",
  itemShares: [],
});

export const getActiveGroup = (rs: CS, groupId?: number) =>
  rs.groups.find((grp) => grp.id === (groupId ?? rs.groupId))!;

export const getDefaultCategory = (rs: CS, groupId?: number) => {
  const group = getActiveGroup(rs, groupId);

  return (
    group.memberships?.at(0)?.defaultCategoryId ??
    group.categories?.at(0)?.id ??
    // in case we have no categories
    -1
  );
};

export const getActiveUsers = (rs: CS) =>
  getActiveGroup(rs).memberships?.map(({ user }) => user!);

export const getActiveReceipt = (rs: CS) => getActiveGroup(rs).activeReceipt!;

export const sortReceipts = (groups: TGroup[]) =>
  groups.forEach((group) =>
    group.receipts?.sort(({ paidOn: a }, { paidOn: b }) =>
      b! < a! ? -1 : b! > a! ? 1 : 0
    )
  );

export function addEmptyReceipts(data: Initializer) {
  for (const group of data.groups) {
    group.receipts?.push({
      id: -1,
      paidOn: VDate.toStrISO(),
      paidById: data.user!.id,
      paidBy: data.user,
      items: [
        // cost is of type string on the client side, big deal! :'D
        addItem(getDefaultCategory(data as CS, group.id!)) as unknown as TItem,
      ],
    });
  }
}
