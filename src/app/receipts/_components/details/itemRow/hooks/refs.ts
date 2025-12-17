import { useMemo, useRef } from "react";

export default function useItemRowRefs() {
  const category = useRef<HTMLSelectElement>(null);
  const notes = useRef<HTMLTextAreaElement>(null);
  const shares = useRef<HTMLDivElement>(null);
  const rmRow = useRef<HTMLButtonElement>(null);
  const addRow = useRef<HTMLButtonElement>(null);
  const cost = useRef<HTMLInputElement>(null);

  return useMemo(() => ({ category, notes, shares, rmRow, addRow, cost }), []);
}
