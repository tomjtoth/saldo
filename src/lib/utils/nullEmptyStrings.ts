type ObjectWithUnknownValues = { [key: string]: unknown };
type ObjectWithNulledStrings<T> = {
  [P in keyof T]: T[P] extends string ? string | null : T[P];
};

export function nullEmptyStrings(obj: ObjectWithUnknownValues): void {
  for (const key in obj) {
    const val = obj[key];

    if (val === "") (obj[key] as unknown | null) = null;
  }
}

export function nulledEmptyStrings<T extends ObjectWithUnknownValues>(
  obj: T
): ObjectWithNulledStrings<T> {
  const res = { ...obj };

  nullEmptyStrings(res);

  return res as ObjectWithNulledStrings<T>;
}
