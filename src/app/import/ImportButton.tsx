"use client";

import { importV3 } from "@/lib/utils/import_v3";

export default function ImportButton() {
  return <button onClick={() => importV3()}>re-import V3</button>;
}
