"use client";

import { importV3 } from "@/lib/services/import-v3";

export default function ImportButton() {
  return <button onClick={() => importV3()}>re-import V3</button>;
}
