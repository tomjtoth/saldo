import { Dispatch, SetStateAction } from "react";

import { User } from "@/app/(users)/_lib";

export function virt(
  entity: Pick<User, "flags">,
  setter?: Dispatch<SetStateAction<number>>
) {
  let int = entity.flags;

  const getFlag = (bit: number) => (int & (1 << bit)) !== 0;
  const setFlag = (bit: number, value: boolean) => {
    int = value ? int | (1 << bit) : int & ~(1 << bit);
    finalizeInt();
  };

  const finalizeInt = () => {
    if (setter) setter(int);
    else entity.flags = int;
  };

  return {
    get active() {
      return getFlag(0);
    },

    set active(value: boolean) {
      setFlag(0, value);
    },

    get admin() {
      return getFlag(1);
    },

    set admin(value: boolean) {
      setFlag(1, value);
    },

    toggle(key: "active" | "admin") {
      this[key] = !this[key];

      return int;
    },
  };
}
