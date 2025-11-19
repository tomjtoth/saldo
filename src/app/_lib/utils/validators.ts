import { VDate } from "./datetime";
import { err } from "./errors";

const RE_3_CONSECUTIVE_LETTERS = /\p{Letter}{3,}/u;

export const is = {
  number(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
  },

  numberOrNull(value: unknown): value is number | null {
    return (typeof value === "number" && !isNaN(value)) || value === null;
  },

  numberOrUndefined(value: unknown): value is number | undefined {
    return (typeof value === "number" && !isNaN(value)) || value === undefined;
  },

  numberNullOrUndefined(value: unknown): value is number | null | undefined {
    return (
      (typeof value === "number" && !isNaN(value)) ||
      value === null ||
      value === undefined
    );
  },

  string(value: unknown): value is string {
    return typeof value === "string";
  },

  stringOrNull(value: unknown): value is string | null {
    return typeof value === "string" || value === null;
  },

  stringOrUndefined(value: unknown): value is string | undefined {
    return typeof value === "string" || value === undefined;
  },

  stringNullOrUndefined(value: unknown): value is string | null | undefined {
    return typeof value === "string" || value === null || value === undefined;
  },

  undefined(value: unknown): value is undefined {
    return typeof value === "undefined";
  },

  null(value: unknown): value is null {
    return value === null;
  },

  array: Array.isArray,

  function(value: unknown): value is Function {
    return typeof value === "function";
  },

  stringWith3ConsecutiveLetters(value: unknown): value is string {
    if (!this.string(value) || !value.match(RE_3_CONSECUTIVE_LETTERS))
      err("must have at least 3 consecutive letters");

    return true;
  },

  parsableIntoDate(value: unknown): value is string {
    return this.string(value) && VDate.couldBeParsedFrom(value);
  },
};
