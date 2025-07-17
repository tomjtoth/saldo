import { has3ConsecutiveLetters, isEmail } from "../utils";
import { COL_RSI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TGroup } from "./group";
import { TMembership } from "./membership";

type TUserBase = {
  email: string;
  name: string;
  image?: string;
  defaultGroupId?: number;
};

export type TUser = TModelSRI &
  TUserBase & {
    Memberships?: TMembership[];
    Groups?: TGroup[];
  };

export type TCrUser = TCrModelSRI & TUserBase;

export const Users = new Model<TUser, TCrUser>("users", {
  ...COL_RSI,

  email: {
    type: "string",
    required: true,
    validators: [isEmail],
  },

  name: {
    type: "string",
    required: true,
    validators: [has3ConsecutiveLetters],
  },

  image: {
    type: "string",
  },

  defaultGroupId: {
    type: "number",
  },
});
