import Link from "next/link";

import { Category, CategoryArchive, Revision, Status } from "@/lib/models";
import Header from "@/components/header";

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const id = (await params).id;

  const cat = await Category.findByPk(id, {
    include: [
      Revision,
      Status,
      {
        model: CategoryArchive,
        as: "archives",
        include: [Revision, Status],
      },
    ],
  });

  if (!cat) return new Response(null, { status: 404 });

  return (
    <>
      <Header>
        <div className="flex gap-2 items-center">
          <Link href="/categories" className="hover:no-underline">
            🔙
          </Link>
          <h2>Previous revisions</h2>
        </div>
      </Header>
      <div className="p-2">
        <table className="w-full text-center [&_th]:p-2 [&_td]:p-2">
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
                <td>{cat.Status!.description}</td>
                <td>{cat.Revision!.revOn}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
