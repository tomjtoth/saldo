import { Updater } from "./updater";

export const COL_RS = {
  revisionId: {
    type: "number",
    reqiured: true,
  },
  statusId: {
    type: "number",
    defaultValue: 1,
  },
};

export const COL_RSI = {
  id: {
    type: "number",
    primaryKey: true,
  },

  ...COL_RS,
};

export type TModelSR = {
  revisionId: number;
  statusId: number;
};

export type TCrModelSR = Partial<TModelSR>;

export type TModelSRI = TModelSR & {
  id: number;
};

export type TCrModelSRI = TCrModelSR & { id?: number };

export class Model<M, C, D = M> extends Updater<M, C, D> {}
