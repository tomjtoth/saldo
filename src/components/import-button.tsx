import { importV3 } from "@/lib/services/import-v3";

export default function ImportButton() {
  return (
    <form action={importV3}>
      <button id="import-btn" type="submit">
        re-import V3
      </button>
    </form>
  );
}
