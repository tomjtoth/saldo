"use client";

import { useState } from "react";
import { toast } from "react-toastify";
import { signIn } from "next-auth/react";

import { has3WordChars, toastifyMsgs, sendJSON, err } from "@/lib/utils";
import { TCategory } from "@/lib/models";
import { useAppDispatch } from "@/lib/hooks";
import { rCategories as red } from "@/lib/reducers/categories";
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
            if (!res.ok) {
              if (res.status === 401) signIn("", { redirectTo: "/categories" });
              else err("tripping toastify");
            }

            const body = await res.json();
            dispatch(red.add(body as TCategory));
            setBuffer("");
          }),
          toastifyMsgs(`Saving "${buffer}" to db`)
        );
      }}
    >
      <input
        {...{
          id: "category-adder",
          ...CATEGORIES_INPUT_PROPS,
          placeholder: "Add new here...",
          value: buffer,
          onChange: (ev) => setBuffer(ev.target.value),
        }}
      />
    </form>
  );
}
