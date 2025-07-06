import { getCatsDataFor } from "@/lib/services/categories";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliCategoriesPage from "@/components/categories";

export const dynamic = "force-dynamic";

export default async ({ params }: TPage<{ catId?: string }>) => {
  const catId = Number((await params).catId);

  return protectedPage<{ catId?: string }>({
    params,
    resolveParams: ({ groupId, catId }) => {
      const gidAsNum = Number(groupId);

      return {
        redirectTo: `${groupId ? `/groups/${groupId}` : ""}/categories${
          catId ? `/${catId}` : ""
        }`,
        groupId: isNaN(gidAsNum) ? undefined : gidAsNum,
      };
    },

    getData: getCatsDataFor,
    children: <CliCategoriesPage catId={isNaN(catId) ? undefined : catId} />,
    rewritePath: "/categories",
  });
};
