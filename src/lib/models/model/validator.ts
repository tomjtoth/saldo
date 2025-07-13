import { asArray, err, TMix } from "@/lib/utils";
import { Core } from "./core";

export class Validator<M, C, D> extends Core<M, D> {
  protected validate(obj: TMix<C | M>) {
    const arr = asArray(obj);
    const keys = Object.keys(this.columns);

    arr.forEach((row) => {
      keys.forEach((key) => {
        let val = row[key as keyof (C | M)] as unknown;
        const col = this.columns[key as keyof M];
        const schema = `${this.tableName}.${key}`;

        let valType = typeof val;
        if (valType === "undefined") {
          if (col.required) err(`${schema} is required, but undefined`);

          val = (row[key as keyof (C | M)] as
            | boolean
            | string
            | number
            | null) = col.defaultValue
            ? typeof col.defaultValue === "function"
              ? col.defaultValue()
              : col.defaultValue
            : null;

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
      });
    });

    return arr as M[];
  }
}
