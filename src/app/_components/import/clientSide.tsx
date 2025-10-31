"use client";

import { svcImportV3 } from "@/app/_lib/services/importV3";
import { appToast } from "@/app/_lib/utils";
import { useEffect, useState } from "react";

export type FromDB = {
  revisions: number;
  users: number;
  groups: number;
  memberships: number;
  categories: number;
  receipts: number;
  items: number;
  itemShares: number;
};

export default function CliImportSection(fromDB: FromDB) {
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
