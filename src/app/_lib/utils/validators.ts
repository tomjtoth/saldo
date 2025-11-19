import { VDate } from "./datetime";
import { err } from "./errors";

const RE_3_CONSECUTIVE_LETTERS = /\p{Letter}{3,}/u;

export const is = {
  number(value: unknown): value is number {
    return typeof value === "number" && !isNaN(value);
  },

  numberOrNull(value: unknown): value is number | null {
    return this.number(value) || this.null(value);
  },

  numberOrUndefined(value: unknown): value is number | undefined {
    return this.number(value) || this.undefined(value);
  },

  numberNullOrUndefined(value: unknown): value is number | null | undefined {
    return this.numberOrNull(value) || this.undefined(value);
  },

  string(value: unknown): value is string {
    return typeof value === "string";
  },

  stringOrNull(value: unknown): value is string | null {
    return this.string(value) || this.null(value);
  },

  stringOrUndefined(value: unknown): value is string | undefined {
    return this.string(value) || this.undefined(value);
  },

  stringNullOrUndefined(value: unknown): value is string | null | undefined {
    return this.stringOrNull(value) || this.undefined(value);
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
