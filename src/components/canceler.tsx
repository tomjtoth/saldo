"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hideSidepanel } from "@/lib/reducers/overlay";

export default function Canceler() {
  const dispatch = useAppDispatch();
  const spOpen = useAppSelector((s) => s.overlay.sidepanelOpened);

  return !spOpen ? null : (
    <div
      className="absolute h-full w-full bg-background/50 backdrop-blur-xs"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) {
          if (spOpen) dispatch(hideSidepanel());
        }
      }}
    />
  );
}
