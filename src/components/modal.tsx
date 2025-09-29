"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";
import Canceler from "./canceler";

const Ctx = createContext<Dispatch<SetStateAction<ReactNode>>>(() => {});

export const useModal = () => useContext(Ctx);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ReactNode>(null);

  return (
    <Ctx.Provider value={setModal}>
      {modal && <Canceler onClick={() => setModal(null)}>{modal}</Canceler>}
      {children}
    </Ctx.Provider>
  );
}
