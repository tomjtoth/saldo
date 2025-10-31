import { err } from "./errors";

const RE_3_CONSECUTIVE_LETTERS = /\p{Letter}{3,}/u;

export function has3ConsecutiveLetters(val: string) {
  if (!val.match(RE_3_CONSECUTIVE_LETTERS))
    err("must have at least 3 consecutive letters");
}
