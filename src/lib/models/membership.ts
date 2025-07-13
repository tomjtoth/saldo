import { ModelSR, TCrModelSR, TModelSR } from "./model";

type TMembershipBase = {
  groupId: number;
  userId: number;
  defaultCategoryId?: number;
  admin: boolean;
};

export type TMembership = TModelSR & TMembershipBase;
export type TCrMembership = TCrModelSR & TMembershipBase;

export const Memberships = new ModelSR<TMembership, TCrMembership>(
  "memberships",
  {
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
    admin: {
      type: "boolean",
    },
  }
);
