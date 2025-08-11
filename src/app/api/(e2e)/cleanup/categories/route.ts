import { Op } from "sequelize";

import { Category, CategoryArchive, Revision } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.NODE_ENV !== "development")
    return new Response(null, { status: 403 });

  const cats = await Category.findAll({
    where: {
      name: {
        [Op.like]: "test-cat-%",
      },
    },
    include: [
      Revision,
      { model: CategoryArchive, as: "archives", include: [Revision] },
    ],
  });

  cats.forEach(async (cat) => {
    cat.archives!.forEach(async (arch) => {
      await arch.Revision!.destroy();
    });
    await cat.Revision!.destroy();
  });

  return new Response(null, { status: 200 });
}
