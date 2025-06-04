"use client";

import { has3WordChars, toastifyMsgs } from "@/lib/utils";
import { useState } from "react";

import { sendJSON } from "@/lib/utils";
import { toast } from "react-toastify";

export default function CliCategoryAdder() {
  const [descr, setDescr] = useState("");

  return (
    <>
      <form
        onSubmit={async (ev) => {
          ev.preventDefault();
          try {
            has3WordChars(descr);
            toast.promise(
              sendJSON("/api/categories", {
                description: descr,
              }).then(() => setDescr("")),
              toastifyMsgs(`Saving "${descr}" to db`)
            );
          } catch (err) {
            toast.error(err as string);
          }
        }}
      >
        <input
          type="text"
          className="w-full"
          placeholder="Add new here..."
          value={descr}
          onChange={(ev) => setDescr(ev.target.value)}
        />
      </form>
    </>
  );
}
