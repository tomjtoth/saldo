export type NumericKeys<T> = {
  [P in keyof T]: T[P] extends number ? P : never;
}[keyof T];
