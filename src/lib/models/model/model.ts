import { Updater } from "./updater";

export const COL_RS = {
  revisionId: {
    type: "number" as const,
    required: true as const,
  },
  statusId: {
    type: "number" as const,
    defaultValue: 1,
  },
};

export const COL_RSI = {
  id: {
    type: "number" as const,
    primaryKey: true as const,
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
