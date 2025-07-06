"use client";

import { useModal } from "..";

import Canceler from "@/components/canceler";
import Options from "./options";

export default function Modal({ itemId }: { itemId: number }) {
  const { setModal } = useModal();
  const hideModal = () => setModal(null);

  return (
    <Canceler className="sm:hidden z-1" onClick={hideModal}>
      <div
        className={
          "absolute left-1/2 top-1/2 -translate-1/2 " +
          "p-2 flex flex-wrap gap-2 justify-evenly"
        }
        onClick={(ev) => {
          if (ev.target === ev.currentTarget) hideModal();
        }}
      >
        <Options {...{ itemId, hideModal }} />
      </div>
    </Canceler>
  );
}
