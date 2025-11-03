import { getCategories } from "@/app/_lib/services";

import wrapPage from "@/app/_lib/wrapPage";
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
