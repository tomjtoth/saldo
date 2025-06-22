"use client";

import { useState } from "react";

import Canceler from "./canceler";

type AdderHandler = ({
  name,
  description,
}: {
  name: string;
  description: string;
}) => Promise<boolean>;

export default function NameDescrAdder({
  id,
  placeholder,
  handler,
}: {
  id?: string;
  placeholder?: string;
  handler: AdderHandler;
}) {
  const [visible, setVisible] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescr] = useState("");

  return (
    <>
      <button id={id + "-opener"} onClick={() => setVisible(true)}>
        Add new...
      </button>
      {visible && (
        <Canceler onClick={() => setVisible(false)}>
          <form
            id={id + "-form"}
            className={
              "absolute top-1/2 left-1/2 -translate-1/2 p-2 " +
              "rounded border bg-background " +
              "grid gap-2 grid-cols-[min-width_min-width]"
            }
            onSubmit={async (ev) => {
              ev.preventDefault();

              const res = await handler({ name, description });

              if (res) {
                setName("");
                setDescr("");
                setVisible(false);
              }
            }}
          >
            <input
              type="text"
              className="w-full min-w-25"
              placeholder={placeholder ?? "Name"}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
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
      )}
    </>
  );
}
