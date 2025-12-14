import wrapPage from "@/app/_lib/wrapPage";
import { svcGetGroups } from "../groups/_lib";

import CategoriesPage from "./_components";

export default wrapPage<{ catId?: string }>({
  getData: svcGetGroups,
  children({ catId }) {
    const categoryId = Number(catId);
    return <CategoriesPage {...(isNaN(categoryId) ? {} : { categoryId })} />;
  },
  rewritePath: "/categories",
});
