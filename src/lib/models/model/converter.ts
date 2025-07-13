import { asArray, TMix } from "@/lib/utils";
import { Validator } from "./validator";

export class Converter<M, C, D> extends Validator<M, C, D> {
  protected toDB(fromJS: TMix<M>) {
    const arr = asArray(fromJS) as M[] | D[];

    return arr.map((row) => {
      let tmp = row as D | M;

      if (this._toDB) tmp = this._toDB(tmp as M);

      this.boolCols.forEach(([key]) => {
        (tmp[key as keyof (D | M)] as boolean) = (tmp[key as keyof (D | M)]
          ? 1
          : 0) as unknown as boolean;
      });

      return tmp as D;
    });
  }

  protected toJS(fromDB: TMix<D>) {
    const arr = asArray(fromDB) as D[] | M[];

    return arr.map((row) => {
      let tmp = row as D | M;

      if (this._toJS) tmp = this._toJS(tmp as D);

      this.boolCols.forEach(([key]) => {
        const asInt = (tmp[key as keyof (D | M)] ? 1 : 0) as unknown as boolean;

        (tmp[key as keyof (D | M)] as boolean) = asInt;
      });

      return tmp as M;
    });
  }
}
