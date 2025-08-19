import { getCategories } from "@/lib/services/categories";

import protectedPage from "@/lib/protectedPage";
import CliCategoriesPage from "@/components/categories";

export default protectedPage<{ catId?: string }>({
  resolveParams: ({ groupId, catId }) => ({
    redirectTo: `${groupId ? `/groups/${groupId}` : ""}/categories${
      catId ? `/${catId}` : ""
    }`,
    groupId,
  }),

  getData: getCategories,
  genChildren({ catId }) {
    const cidAsNum = Number(catId);
    return <CliCategoriesPage catId={isNaN(cidAsNum) ? undefined : cidAsNum} />;
  },
  rewritePath: "/categories",
});
