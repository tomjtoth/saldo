"use client";

import { useAppDispatch } from "@/lib/hooks";
import { showSidepanel } from "@/lib/reducers/overlay";

export default function SidepanelOpenerButton() {
  const dispatch = useAppDispatch();

  return (
    <button id="sidepanel-opener" onClick={() => dispatch(showSidepanel())}>
      ≡
    </button>
  );
}
