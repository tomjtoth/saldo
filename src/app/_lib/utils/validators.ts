import { VDate } from "./datetime";
import { err } from "./errors";

const RE_3_CONSECUTIVE_LETTERS = /\p{Letter}{3,}/u;

export const is = {
  undefined(value: unknown): value is undefined {
    return typeof value === "undefined";
  },

  null(value: unknown): value is null {
    return value === null;
  },

  boolean(value: unknown): value is boolean {
    return typeof value === "boolean";
  },

  function(value: unknown): value is Function {
    return typeof value === "function";
  },

  array: Array.isArray,

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

  stringWith3ConsecutiveLetters(value: unknown): value is string {
    if (!this.string(value) || !value.match(RE_3_CONSECUTIVE_LETTERS))
      err("must have at least 3 consecutive letters");

    return true;
  },

  parsableIntoDate(value: unknown): value is string {
    return this.string(value) && VDate.couldBeParsedFrom(value);
  },
};

// Turns `value is T` into `asserts value is T`
type GuardToAssert<F> = F extends (value: unknown) => value is infer T
  ? (value: unknown, name?: string) => asserts value is T
  : never;

type BeType<T> = {
  [K in keyof T]: GuardToAssert<T[K]>;
};

type IsType = typeof is;
type Be = BeType<IsType>;

export const be: Be = new Proxy(is, {
  get(target, prop, receiver) {
    const value = Reflect.get(target, prop, receiver);

    if (typeof value === "function") {
      const method = String(prop).replaceAll(
        /(?<=\p{Lowercase}|\d)[\p{Uppercase}\d]/gu,
        (uppercaseOrNumber) => ` ${uppercaseOrNumber.toLowerCase()}`
      );

      // Wrap the original function to turn return-value narrowing
      // into assertion narrowing
      return function (v: unknown, name?: string) {
        const res = value.call(target, v);

        if (!res) {
          err(
            400,
            `${name ? `${name}'s value` : "Value"} "${v}" should be ${method}!`
          );
        }
      };
    }

    return value;
  },
});

const xx: number | null | boolean | string = "123" === "123";

be.boolean(xx, "xx");
xx;

function vv<V>(val: {
  [name: string]: unknown;
}): asserts val is { [name: string]: V } {}
