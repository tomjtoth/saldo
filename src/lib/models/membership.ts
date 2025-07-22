import { COL_SRI, Model, TCrModelSR, TModelSR } from "./model";
import { TGroup } from "./group";
import { TUser } from "./user";

type TMembershipBase = {
  groupId: number;
  userId: number;
  defaultCategoryId?: number;
  isAdmin: boolean;
};

export type TMembership = TModelSR &
  TMembershipBase & {
    Group?: TGroup;
    User?: TUser;
  };

export type TCrMembership = TCrModelSR & TMembershipBase;

export const Memberships = new Model<TMembership, TCrMembership>(
  "memberships",
  {
    ...COL_SRI,

    groupId: {
      type: "number",
      primaryKey: true,
    },
    userId: {
      type: "number",
      primaryKey: true,
    },
    defaultCategoryId: {
      type: "number",
    },
    isAdmin: {
      type: "boolean",
    },
  }
);
