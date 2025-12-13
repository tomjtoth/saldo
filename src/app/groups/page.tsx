import wrapPage from "@/app/_lib/wrapPage";
import { svcGetGroups } from "./_lib";

import GroupsPage from "./_components";

export default wrapPage({
  getData: svcGetGroups,
  children: <GroupsPage />,
  rewritePath: "/groups",
});
