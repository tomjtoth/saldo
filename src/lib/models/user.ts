import { has3ConsecutiveLetters, isEmail } from "../utils";
import { ModelSRI, TCrModelSRI, TModelSRI } from "./model";

type TUserBase = {
  email: string;
  name: string;
  image?: string;
  defaultGroupId?: number;
};

export type TUser = TModelSRI & TUserBase;
export type TCrUser = TCrModelSRI & TUserBase;

export const Users = new ModelSRI<TUser, TCrUser>("users", {
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
