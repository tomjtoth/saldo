"use client";

import { useState } from "react";
import { toast } from "react-toastify";

import { has3WordChars, toastifyMsgs, sendJSON, err } from "@/lib/utils";
import { TCliCategory } from "@/lib/models";
import { useAppDispatch } from "@/lib/hooks";
import { rCats } from "@/lib/reducers/categories";
import { CATEGORIES_INPUT_PROPS } from "./config";

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
            if (!res.ok) err("tripping toastify");

            const body = await res.json();
            dispatch(rCats.add(body as TCliCategory));
            setBuffer("");
          }),
          toastifyMsgs(`Saving "${buffer}" to db`)
        );
      }}
    >
      <input
        {...{
          ...CATEGORIES_INPUT_PROPS,
          placeholder: "Add new here...",
          value: buffer,
          onChange: (ev) => setBuffer(ev.target.value),
        }}
      />
    </form>
  );
}
