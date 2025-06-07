import { Category, CategoryArchive, Revision, Status } from "@/lib/models";
import { CliCategoryPage } from "@/components/categories";

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

  return <CliCategoryPage cat={cat.get({ plain: true })} />;
}
