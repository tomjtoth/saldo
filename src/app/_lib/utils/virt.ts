import { Dispatch, SetStateAction } from "react";

import { User } from "@/app/(users)/_lib";

const flags = ["active", "admin"] as const;
const togglers = flags.map((f) => `toggle${f[0].toUpperCase() + f.slice(1)}`);

type FlagName = (typeof flags)[number];
type ToggleName<K extends string> = `toggle${Capitalize<K>}`;

type FlagProxyShape = {
  [K in FlagName]: boolean;
} & {
  [K in ToggleName<FlagName>]: () => number;
};

export function virt(
  entity: Pick<User, "flags">,
  setter?: Dispatch<SetStateAction<number>>
) {
  let int = entity.flags;

  const getFlag = (bit: number) => (int & (1 << bit)) !== 0;

  const setFlag = (bit: number, value: boolean) => {
    int = value ? int | (1 << bit) : int & ~(1 << bit);

    if (setter) setter(int);
    else entity.flags = int;
  };

  const proxy: FlagProxyShape = new Proxy(Object.create(null), {
    get(_, prop) {
      let idx = flags.findIndex((f) => f === prop);
      if (idx > -1) return getFlag(idx);

      idx = togglers.findIndex((f) => f === prop);
      if (idx > -1)
        return () => {
          setFlag(idx, !getFlag(idx));
          return int;
        };
    },

    set(_, prop, value) {
      const idx = flags.findIndex((f) => f === prop);

      if (idx > -1) {
        setFlag(idx, value);

        return true;
      }

      return false;
    },
  });

  return proxy;
}
