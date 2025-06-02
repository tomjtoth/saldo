"use client";

import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import { hideSidepanel, hideUserMenu } from "@/lib/reducers/overlay";

export default function Canceler() {
  const dispatch = useAppDispatch();
  const spOpen = useAppSelector((s) => s.overlay.sidepanelOpened);
  const uoOpen = useAppSelector((s) => s.overlay.userOptsOpened);

  return spOpen || uoOpen ? (
    <div
      className="absolute h-full w-full"
      onClick={(ev) => {
        if (ev.target === ev.currentTarget) {
          dispatch(hideUserMenu());
          dispatch(hideSidepanel());
        }
      }}
    />
  ) : null;
}
