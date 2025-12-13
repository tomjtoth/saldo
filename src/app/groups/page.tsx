import { svcGetGroups } from "./_lib";

import wrapPage from "@/app/_lib/wrapPage";
import GroupsPage from "./_components";

export default wrapPage({
  getData: svcGetGroups,
  children: <GroupsPage />,
  rewritePath: "/groups",
});
