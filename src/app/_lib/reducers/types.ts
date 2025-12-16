import { User } from "@/app/(users)/_lib";
import { Group } from "@/app/groups/_lib";
import { Receipt } from "@/app/receipts/_lib";

export interface CliGroup extends Group {
  activeReceipt?: Receipt & {
    focusedIdx?: number;
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
};
