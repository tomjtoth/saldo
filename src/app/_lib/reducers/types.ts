import { User } from "@/app/(users)/_lib";
import { Group } from "@/app/groups/_lib";
import { Item, Receipt } from "@/app/receipts/_lib";

// TODO: refactor receipts related under something similar to `.receipts`
export interface CliGroup extends Group {
  activeReceipt?: Receipt & {
    focusedItemId?: Item["id"];
    changes: number;
  };
  hasMoreToLoad?: boolean;
  fetchingReceipts?: boolean;
  debounceReceiptsFetching?: number;
}

export type CombinedState = {
  user?: User;
  groupId?: number;
  groups: CliGroup[];
  showReceiptItemsSummary: boolean;
};
