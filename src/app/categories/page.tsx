import { getCategories } from "@/lib/services/categories";

import wrapPage from "@/lib/wrapPage";
import CliCategoriesPage from "./_components";

export default wrapPage<{ catId?: string }>({
  resolveParams: ({ groupId, catId }) => ({
    redirectTo: `${groupId ? `/groups/${groupId}` : ""}/categories${
      catId ? `/${catId}` : ""
    }`,
    groupId,
  }),

  getData: getCategories,
  children({ catId }) {
    const cidAsNum = Number(catId);
    return <CliCategoriesPage catId={isNaN(cidAsNum) ? undefined : cidAsNum} />;
  },
  rewritePath: "/categories",
});
