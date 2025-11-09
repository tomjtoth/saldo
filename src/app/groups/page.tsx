import { svcGetGroups } from "./_lib";

import wrapPage from "@/app/_lib/wrapPage";
import CliGroupsPage from "./_components";

export default wrapPage({
  resolveParams: ({ groupId }) => ({
    redirectTo: groupId ? `/groups/${groupId}` : "/groups",
    groupId,
  }),

  getData: svcGetGroups,
  children: <CliGroupsPage />,
  rewritePath: "/groups",
});
