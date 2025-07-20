import { asArray } from "@/lib/utils";
import { TMix } from "@/lib/types";
import { TDbValids, TValids } from "./types";
import { Validator } from "./validator";

export class Converter<M, C, D> extends Validator<M, C> {
  protected toDB(fromJS: TMix<M>) {
    const arr = asArray(fromJS);

    return arr.map((row) => {
      let tmp = row as M | D;

      this.iterCols.forEach(([col, { toDB, type }]) => {
        const keyMD = col as keyof (M | D);

        if (tmp[keyMD] !== undefined) {
          // columns specific conversion first
          if (toDB) (tmp[keyMD] as TDbValids) = toDB(tmp[keyMD] as TValids);

          // then general
          if (type === "boolean") {
            (tmp[keyMD] as number) = (tmp[keyMD] ? 1 : 0) as number;
          }
        }
      });

      return tmp as D;
    });
  }

  protected toJS(fromDB: TMix<D>) {
    const arr = asArray(fromDB);

    return arr.map((row) => {
      let tmp = row as M | D;

      this.iterCols.forEach(([col, { toJS, type }]) => {
        const keyMD = col as keyof (M | D);

        if (tmp[keyMD] !== undefined) {
          // general conversion first
          if (type === "boolean") {
            const asInt = (tmp[keyMD] ? 1 : 0) as unknown as boolean;

            (tmp[keyMD] as boolean) = asInt;
          }

          // then column specific
          if (toJS) (tmp[keyMD] as TValids) = toJS(tmp[keyMD] as TDbValids);
        }
      });

      return tmp as M;
    });
  }
}
