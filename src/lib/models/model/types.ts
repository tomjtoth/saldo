import { QueryWrapper } from "./queryWrapper";
import { QueryBuilder } from "./queryBuilder";

export type TDbValids = number | string | null;
export type TValids = TDbValids | boolean | object;

export type TSelectKeys<T> = {
  [P in keyof T]: T[P] extends Exclude<TValids, object> ? P : never;
}[keyof T];

export type TwoOrMore<T> = [T, T, ...T[]];

export type JoinTypes = "LEFT" | "INNER";

type TOpOr<T> = {
  /**
   * An array of alternatives joined by the logical operator "OR"
   */
  $EITHER: TwoOrMore<TWhere<T>>;
};

export type TOpNot<T> = {
  /**
   * All criteria are joined by the logical operator "AND"
   */
  $NOT: T;
};

export type TLiteral = {
  /**
   * injects the provided string into the statement
   */
  $SQL: string;
};

type TOpLt<T> = {
  /**
   * Less Than
   */
  $LT: T | TLiteral;
};

type TOpLe<T> = {
  /**
   * Less than or Equal to
   */
  $LE: T | TLiteral;
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
  $GE: T | TLiteral;
};

type TOpBetween<T> = { $BETWEEN: [T | TLiteral, T | TLiteral] };
type TOpIn<T> = { $IN: TwoOrMore<T | TLiteral> };
type TOpLike = { $LIKE: string };

type OnlyOne<T> = {
  [K in keyof T]: { [P in K]: T[K] } & Partial<
    Record<Exclude<keyof T, K>, never>
  >;
}[keyof T];

type TOpCommon<T> =
  | T
  | null
  | TLiteral
  | TOpIn<T>
  | TOpBetween<T>

  // TODO: figure out how to mutually exclude
  // - GT vs GE
  // - LT vs LE
  // - BETWEEN vs IN
  // while allowing the others...
  // | OnlyOne<TOpBetween<T> & TOpIn<T>>
  // | OnlyOne<TOpLt<T> & TOpLe<T>>
  // | OnlyOne<TOpGt<T> & TOpGe<T>>;
  | TOpLt<T>
  | TOpLe<T>
  | TOpGt<T>
  | TOpGe<T>;

export type TStrOps<T = TOpCommon<string> | TOpLike> = T | TOpNot<T>;
export type TNumOps<T = TOpCommon<number>> = T | TOpNot<T>;

export type TWhere<D> =
  | TOpOr<D>
  | {
      [P in keyof D]?: D[P] extends number | undefined
        ? TNumOps
        : D[P] extends string | undefined
        ? TStrOps
        : never;
    };

export type TQuery<D> = {
  select?: (keyof D)[];
  join?: TQuery<D>[];
  table?: string;
  joinType?: JoinTypes;

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
