"use client";

import { useEffect, useState } from "react";

import { svcImportV3, TEntriesInDbOfEachTable } from "@/app/_lib/services";
import { appToast } from "@/app/_lib/utils";

export default function CliImportSection(fromDB: TEntriesInDbOfEachTable) {
  const [data, setData] = useState(fromDB);

  useEffect(() => {
    setData(fromDB);
  }, []);

  return (
    <div className="rounded border p-2 max-w-fit flex flex-col items-center">
      <h3>Current data in the DB</h3>

      {Object.entries(data).map(([key, val]) => (
        <p key={key}>
          {val} {key}
        </p>
      ))}

      <button
        id="import-btn"
        onClick={() => {
          appToast.promise(
            svcImportV3().then((res) => setData(res)),
            "Dropping and re-populating all data in DB"
          );
        }}
      >
        re-import V3
      </button>
    </div>
  );
}
