"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";

import { makeStore, AppStore } from "@/app/_lib/store";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const storeRef = useRef<AppStore>(undefined);

  // eslint-disable-next-line react-hooks/refs
  if (!storeRef.current) {
    // Create the store instance the first time this renders
    storeRef.current = makeStore();
  }

  // eslint-disable-next-line react-hooks/refs
  return <Provider store={storeRef.current}>{children}</Provider>;
}
