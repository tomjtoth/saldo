import { Dispatch, SetStateAction } from "react";

import { User } from "@/app/(users)/_lib";

const flags = ["active", "admin"] as const;
const togglers = flags.map((f) => `toggle${f[0].toUpperCase() + f.slice(1)}`);

type Entity = Pick<User, "flags">;
type FlagName = (typeof flags)[number];
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

  flags.forEach((flag, bit) => {
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

    Object.defineProperty(obj, togglers[bit], {
      enumerable: true,
      configurable: false,
      value() {
        setFlag(bit, !getFlag(bit));
        return int;
      },
    });
  });

  return obj;
}

export const virt = Object.assign(
  inner,
  flags.reduce((acc, f) => {
    acc[f] = (e: Entity) => inner(e)[f];
    return acc;
  }, {} as { [F in FlagName]: (e: Entity) => boolean })
);
