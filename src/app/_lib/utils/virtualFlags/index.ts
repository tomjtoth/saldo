import { Dispatch, SetStateAction } from "react";

import { User } from "@/app/(users)/_lib";

const flags = {
  active: 0,
  admin: 1,
  template: 1,
} as const;

const flagsEntries = Object.entries(flags);

type Entity = Pick<User, "flags">;
type FlagName = keyof typeof flags;
type ToggleName<K extends string> = `toggle${Capitalize<K>}`;

type VirtualFlags = {
  [K in FlagName]: boolean;
} & {
  [K in ToggleName<FlagName>]: () => number;
};

function inner(entity: Entity, setter?: Dispatch<SetStateAction<number>>) {
  let int = entity.flags;

  const getFlag = (bit: number) => (int & (1 << bit)) !== 0;

  const setFlag = (bit: number, value: boolean) => {
    int = value ? int | (1 << bit) : int & ~(1 << bit);

    if (setter) setter(int);
    else entity.flags = int;
  };

  const obj: VirtualFlags = Object.create(null);

  flagsEntries.forEach(([flag, bit]) => {
    Object.defineProperty(obj, flag, {
      enumerable: true,
      configurable: false,

      get() {
        return getFlag(bit);
      },

      set(value: boolean) {
        setFlag(bit, value);
      },
    });

    Object.defineProperty(
      obj,
      `toggle${flag[0].toUpperCase() + flag.slice(1)}`,
      {
        enumerable: true,
        configurable: false,
        value() {
          setFlag(bit, !getFlag(bit));
          return int;
        },
      },
    );
  });

  return obj;
}

/**
 * ### virtualFlags
 * is an extension to DB tables that manipulates one unified integer
 * - `.active`
 * - `.admin`
 * - `.template`
 */
export const vf = Object.assign(
  inner,
  flagsEntries.reduce(
    (acc, [flag]) => {
      const f = flag as keyof typeof flags;
      acc[f] = (e: Entity) => inner(e)[f];
      return acc;
    },
    {} as { [F in FlagName]: (e: Entity) => boolean },
  ),
);
