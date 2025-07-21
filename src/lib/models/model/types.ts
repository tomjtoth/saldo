import { QueryWrapper } from "./queryWrapper";
import { QueryBuilder } from "./queryBuilder";

export type TDbValids = number | string | null;
export type TValids = TDbValids | boolean | object;

export type TSelectKeys<T> = {
  [P in keyof T]: T[P] extends TDbValids ? P : never;
}[keyof T];

type TOpOr<T> = {
  /**
   * An array of alternatives
   */
  $OR: TWhere<T>[];
};

type TOpNot<T> = { $NOT: T };

type TLiteral = {
  /**
   * injects the provided string into the statement
   */
  $SQL: string;
};

type TOpLt<T> = {
  /**
   * Less Than
   */
  $LT: T;
};

type TOpLe<T> = {
  /**
   * Less than or Equal to
   */
  $LE: T;
};

type TOpGt<T> = {
  /**
   * Greater Than
   */
  $GT: T | TLiteral;
};

type TOpGe<T> = {
  /**
   * Greater than or Equal to
   */
  $GE: T;
};

type TOpBetween<T> = { $BETWEEN: [T, T] };
type TOpIn<T> = { $IN: T[] };
type TOpLike = { $LIKE: string };

type TStrOps =
  | null
  | string
  | TLiteral
  | TOpIn<string>
  | TOpBetween<string>
  | TOpLt<string>
  | TOpLe<string>
  | TOpGt<string>
  | TOpGe<string>
  | TOpLike;

type TNumOps =
  | null
  | number
  | TLiteral
  | TOpIn<number>
  | TOpBetween<number>
  | TOpLt<number>
  | TOpLe<number>
  | TOpGt<number>
  | TOpGe<number>;

export type TWhere<D> =
  | TOpOr<D>
  | {
      [P in keyof D]?: D[P] extends number
        ? TNumOps | TOpNot<TNumOps>
        : D[P] extends string
        ? TStrOps | TOpNot<TStrOps>
        : never;
    };

export type TQuery<D> = {
  select?: (keyof D)[];
  join?: TQuery<D>[];
  table?: string;

  /**
   * turns the `LEFT JOIN` into an `INNER JOIN`
   */
  required?: true;

  /**
   * all members of this level are connected by "AND"
   */
  where?: TWhere<D>;
};

export type TOther<M = any, D = any> =
  | QueryWrapper<M, any, D>
  | QueryBuilder<M, D>;

export type TModelSR = {
  revisionId: number;
  statusId: number;
};

export type TCrModelSR = Partial<TModelSR>;

export type TModelSRI = TModelSR & {
  id: number;
};

export type TCrModelSRI = TCrModelSR & { id?: number };
