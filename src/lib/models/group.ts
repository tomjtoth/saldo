import { has3ConsecutiveLetters } from "../utils";

import { COL_RSI, Model, TCrModelSRI, TModelSRI } from "./model";
import { TCategory } from "./category";
import { TMembership } from "./membership";
import { TUser } from "./user";

import { TBalanceChartData } from "@/components/balance/chart";
import { TParetoChartData } from "@/components/pareto/chart";

type TGroupBase = {
  name: string;
  description?: string;
  uuid?: string;
};

export type TGroup = TModelSRI &
  TGroupBase & {
    Users?: TUser[];
    Categories?: TCategory[];
    Archives?: TGroup[];
    Memberships?: TMembership[];

    Balance?: TBalanceChartData;
    Pareto?: TParetoChartData;
  };

export type TCrGroup = TCrModelSRI & TGroupBase;

export const Groups = new Model<TGroup, TCrGroup>("groups", {
  ...COL_RSI,

  name: {
    type: "string",
    required: true,
    validators: [has3ConsecutiveLetters],
  },
  description: {
    type: "string",
  },
  uuid: {
    type: "string",
    skipArchival: true,
  },
});
