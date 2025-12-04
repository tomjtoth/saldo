import { svcGetGroups } from "../groups/_lib";

import wrapPage from "@/app/_lib/wrapPage";
import CategoriesPage from "./_components";

export default wrapPage<{ catId?: string }>({
  resolveParams: ({ groupId, catId }) => ({
    redirectTo: `${groupId ? `/groups/${groupId}` : ""}/categories${
      catId ? `/${catId}` : ""
    }`,
    groupId,
  }),

  getData: svcGetGroups,

  children({ catId }) {
    const cidAsNum = Number(catId);
    return (
      <CategoriesPage categoryId={isNaN(cidAsNum) ? undefined : cidAsNum} />
    );
  },

  rewritePath: "/categories",
});
