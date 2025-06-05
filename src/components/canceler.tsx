"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hideSidepanel, hideUserMenu } from "@/lib/reducers/overlay";

export default function Canceler() {
  const dispatch = useAppDispatch();
  const spOpen = useAppSelector((s) => s.overlay.sidepanelOpened);
  const umOpen = useAppSelector((s) => s.overlay.userMenuOpened);

  return !spOpen && !umOpen ? null : (
    <div
      className="absolute h-full w-full bg-background/50 backdrop-blur-xs"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) {
          if (umOpen) dispatch(hideUserMenu());
          if (spOpen) dispatch(hideSidepanel());
        }
      }}
    />
  );
}
