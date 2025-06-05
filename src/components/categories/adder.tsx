"use client";

import { has3WordChars, toastifyMsgs } from "@/lib/utils";
import { useState } from "react";

import { sendJSON } from "@/lib/utils";
import { toast } from "react-toastify";
import { TCliCategory } from "@/lib/models";
import { useAppDispatch } from "@/lib/hooks";
import { rCats } from "@/lib/reducers/categories";

export default function CliCategoryAdder() {
  const dispatch = useAppDispatch();
  const [buffer, setBuffer] = useState("");

  return (
    <form
      onSubmit={(ev) => {
        ev.preventDefault();
        try {
          has3WordChars(buffer);
        } catch (err) {
          return toast.error(err as string);
        }

        toast.promise(
          sendJSON("/api/categories", {
            description: buffer,
          }).then(async (res) => {
            if (res.ok) {
              const body = await res.json();
              dispatch(rCats.add(body as TCliCategory));
              setBuffer("");
            }
          }),
          toastifyMsgs(`Saving "${buffer}" to db`)
        );
      }}
    >
      <input
        type="text"
        className="w-full"
        placeholder="Add new here..."
        value={buffer}
        onChange={(ev) => setBuffer(ev.target.value)}
      />
    </form>
  );
}
