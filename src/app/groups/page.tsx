import { getGroups } from "@/lib/services/groups";

import wrapPage from "@/lib/wrapPage";
import CliGroupsPage from "@/components/groups";

export default wrapPage({
  resolveParams: ({ groupId }) => ({
    redirectTo: groupId ? `/groups/${groupId}` : "/groups",
    groupId,
  }),

  getData: getGroups,
  children: <CliGroupsPage />,
  rewritePath: "/groups",
});
