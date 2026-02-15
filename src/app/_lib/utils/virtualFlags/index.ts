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

type VirtualFlagsShape = {
  [K in FlagName]: boolean;
} & {
  [K in ToggleName<FlagName>]: () => number;
};

class VirtualFlags {
  static getFlag(entity: Entity, bit: number) {
    return (entity.flags & (1 << bit)) !== 0;
  }

  constructor(
    protected entity: Entity,
    private setter?: Dispatch<SetStateAction<number>>,
  ) {}

  protected getFlag(bit: number) {
    return VirtualFlags.getFlag(this.entity, bit);
  }

  protected setFlag(bit: number, value: boolean) {
    const next = value
      ? this.entity.flags | (1 << bit)
      : this.entity.flags & ~(1 << bit);

    if (this.setter) this.setter(next);
    else this.entity.flags = next;
  }
}

for (const [flag, bit] of flagsEntries) {
  Object.defineProperty(VirtualFlags.prototype, flag, {
    get(this: VirtualFlags) {
      return this.getFlag(bit);
    },
    set(this: VirtualFlags, value: boolean) {
      this.setFlag(bit, value);
    },
    enumerable: true,
  });

  const togglerName = `toggle${flag[0].toUpperCase()}${flag.slice(1)}`;

  Object.defineProperty(VirtualFlags.prototype, togglerName, {
    value(this: VirtualFlags) {
      const current = this.getFlag(bit);
      this.setFlag(bit, !current);
      return this.entity.flags;
    },
  });
}

function createVF(...params: ConstructorParameters<typeof VirtualFlags>) {
  return new VirtualFlags(...params) as VirtualFlags & VirtualFlagsShape;
}

type MappableMethods = {
  [K in FlagName]: (entity: Entity) => boolean;
};

const mappableMethods = flagsEntries.reduce((acc, [flag, bit]) => {
  acc[flag as FlagName] = (entity: Entity) => VirtualFlags.getFlag(entity, bit);
  return acc;
}, {} as MappableMethods);

export const vf = Object.assign(createVF, mappableMethods);
