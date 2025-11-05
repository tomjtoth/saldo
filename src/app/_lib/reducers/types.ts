import { TGroup, TItem, TReceipt, TUser } from "@/app/_lib/db";

export interface TCliItem extends Omit<TItem, "cost"> {
  cost?: number | string;
}

export interface TCliGroup extends TGroup {
  activeReceipt?: Omit<TReceipt, "items"> & {
    focusedIdx?: number;
    items?: TCliItem[];
  };
}

export type CombinedState = {
  user?: TUser;
  groupId?: number;
  groups: TCliGroup[];
};

export type Initializer = Pick<CombinedState, "groups" | "user">;
