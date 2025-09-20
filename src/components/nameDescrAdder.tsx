"use client";

import { useEffect, useRef, useState } from "react";

import Canceler from "./canceler";

type AdderHandler = (data: {
  name: string;
  description: string;
}) => Promise<void>;

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

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (visible) ref.current?.focus();
  }, [visible]);

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
            onSubmit={(ev) => {
              ev.preventDefault();

              handler({ name, description }).then(() => {
                setName("");
                setDescr("");
                setVisible(false);
              });
            }}
          >
            <input
              type="text"
              className="w-full min-w-25"
              placeholder={placeholder ?? "Name"}
              value={name}
              onChange={(ev) => setName(ev.target.value)}
              ref={ref}
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
