import { getCatsDataFor } from "@/lib/services/categories";

import protectedPage from "@/lib/protectedPage";
import CliCategoriesPage from "@/components/categories";

export const dynamic = "force-dynamic";

export default async ({
  params,
}: {
  params: { groupId?: string; catId?: string };
}) => {
  const catId = Number(params.catId);

  return protectedPage({
    params,
    resolveParams: ({ groupId, catId }) => {
      const asNum = Number(groupId);

      return {
        redirectTo: `${groupId ? `/groups/${groupId}` : ""}/categories${
          catId ? `/${catId}` : ""
        }`,
        groupId: isNaN(asNum) ? undefined : asNum,
      };
    },

    getData: getCatsDataFor,
    children: <CliCategoriesPage catId={isNaN(catId) ? undefined : catId} />,
    rewritePath: "/categories",
  });
};
