import { asArray, err, TMix } from "@/lib/utils";
import { Core } from "./core";
import { TValids } from "./types";

export class Validator<M, C> extends Core<M> {
  /**
   * also called from updater on the archiver blob
   */
  protected validateValue(
    val: unknown,
    key: keyof M,
    assigner?: (val: TValids) => void
  ) {
    const col = this.columns[key];
    const schema = `${this.tableName}.${key as string}`;

    let valType = typeof val;
    if (valType === "undefined") {
      if (col.required) err(`${schema} is required, but undefined`);

      val = col.defaultValue
        ? typeof col.defaultValue === "function"
          ? col.defaultValue()
          : col.defaultValue
        : null;

      if (assigner) assigner(val as TValids);

      valType = typeof val;
    }

    if (
      col.type !== valType &&
      !(!col.required && (val === null || val === undefined))
    )
      err(`${schema} should be of type ${col.type}, but got ${valType}`);

    if (col.validators)
      Object.values(col.validators).forEach((validator) => {
        try {
          validator(val);
        } catch (vErr) {
          err(
            `${schema} failed validation of "${validator.name}": ${
              (vErr as Error).message
            }`
          );
        }
      });
  }

  protected validate(obj: TMix<C | M>) {
    const arr = asArray(obj);
    const keys = Object.keys(this.columns) as (keyof M)[];

    arr.forEach((row) => {
      keys.forEach((key) => {
        let val = row[key as keyof (C | M)] as unknown;

        this.validateValue(val, key, (val) => {
          (row[key as keyof (C | M)] as TValids) = val;
        });
      });
    });

    return arr as M[];
  }
}
