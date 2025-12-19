"use client";

import { useEffect, useRef, useState } from "react";

import { useBodyNodes } from "../_lib/hooks";

import Canceler from "./canceler";

type TEntityAdder = {
  placeholder?: string;
  handler: (data: { name: string; description: string }) => Promise<unknown>;
};

export default function EntityAdderButton(
  args: TEntityAdder & { onClick?: () => void; className?: string }
) {
  const nodes = useBodyNodes();

  return (
    <button
      id="entity-adder-button"
      className={args.className}
      onClick={args.onClick ?? (() => nodes.push(EntityAdder, args))}
    >
      ➕ <span className="hidden sm:inline-block">Add new...</span>
    </button>
  );
}

function EntityAdder({ placeholder, handler }: TEntityAdder) {
  const nodes = useBodyNodes();
  const [name, setName] = useState("");
  const [description, setDescr] = useState("");

  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameRef.current!.focus();
  }, []);

  return (
    <Canceler>
      <form
        id="entity-adder-form"
        className="grid gap-2 grid-cols-[min-width_min-width]"
        onSubmit={(ev) => {
          ev.preventDefault();

          handler({ name, description })
            .then(nodes.pop)
            .catch(() => {});
        }}
      >
        <input
          type="text"
          className="w-full min-w-25"
          placeholder={placeholder ?? "Name"}
          value={name}
          onChange={(ev) => setName(ev.target.value)}
          ref={nameRef}
        />

        <button className="rounded border">💾</button>

        <textarea
          className="col-span-2 resize-none border rounded "
          placeholder="Optional description..."
          value={description}
          onChange={(ev) => setDescr(ev.target.value)}
        />
      </form>
    </Canceler>
  );
}
