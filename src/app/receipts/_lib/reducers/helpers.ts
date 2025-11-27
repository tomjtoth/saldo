import { Group } from "@/app/groups/_lib";
import { Item } from "../populateRecursively";
import { Category } from "@/app/categories/_lib";
import { VDate } from "@/app/_lib/utils";
import { CombinedState as CS } from "@/app/_lib/reducers/types";

// this provides the key prop to React during `items.map( ... )`
// TODO: enable drag n drop re-arrangement of items in adder
let rowId = 0;
export const addItem = (categoryId: Category["id"]): Item => ({
  id: --rowId,
  categoryId,
  cost: 0,
  notes: "",
  itemShares: [],
  archives: [],
  flags: 1,
  receiptId: -1,
  revisionId: -1,
});

export const getActiveGroup = (rs: CS, groupId?: Group["id"]) =>
  rs.groups.find((grp) => grp.id === (groupId ?? rs.groupId))!;

export const getDefaultCategory = (rs: CS, groupId?: Group["id"]) => {
  const group = getActiveGroup(rs, groupId);

  return (
    group.memberships.find((ms) => ms.userId === rs.user?.id)
      ?.defaultCategoryId ??
    group.categories.at(0)?.id ??
    // in case we have no categories at all
    -1
  );
};

export const getActiveUsers = (rs: CS) =>
  getActiveGroup(rs).memberships.map(({ user }) => user);

export const getActiveReceipt = (rs: CS) => getActiveGroup(rs).activeReceipt!;

export const sortReceipts = (groups: Group[]) =>
  groups.forEach((group) =>
    group.receipts.sort(({ paidOn: a }, { paidOn: b }) =>
      b < a ? -1 : b > a ? 1 : 0
    )
  );

export function addEmptyReceipts(data: CS) {
  if (data.user) {
    for (const group of data.groups) {
      group.receipts.push({
        id: -1,
        paidOn: VDate.toStrISO(),
        paidById: data.user.id,
        paidBy: data.user,
        flags: 1,
        groupId: group.id,
        revision: { createdAt: VDate.timeToStr(), createdBy: data.user },
        revisionId: -1,
        archives: [],
        items: [
          addItem(
            getDefaultCategory(
              { ...data, groupId: data.groupId ? data.groupId : -1 },
              group.id
            )
          ),
        ],
      });
    }
  }
}
