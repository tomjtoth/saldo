"use client";

import { useAppSelector } from "@/lib/hooks";
import { TCategory } from "@/lib/models";

export default function CategoryArchives({ cat }: { cat: TCategory }) {
  const statuses = useAppSelector((s) => s.categories.stats);

  const cn = [
    "absolute left-1/2 top-1/2 -translate-1/2 w-7/10 h-4/5",
    "p-2 bg-background border rounded overflow-scroll",
    "text-center [&_th]:p-2 [&_td]:p-2",
  ];

  return (
    <div className={cn.join(" ")}>
      <table className="w-full">
        <thead>
          <tr>
            <th>Description</th>
            <th>Status</th>
            <th>Revisioned 📅</th>
          </tr>
        </thead>
        <tbody>
          {[...cat.archives!, cat].toReversed().map((cat) => (
            <tr key={`${cat.id}-${cat.revId!}`}>
              <td>
                <code>{cat.description.replaceAll(" ", "·")}</code>
              </td>
              <td>
                {statuses.find((st) => st.id === cat.statusId)?.description}
              </td>
              <td>{cat.Revision!.revOn}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
