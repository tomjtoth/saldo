import { getGroups } from "@/lib/services/groups";

import protectedPage from "@/lib/protectedPage";
import CliGroupsPage from "@/components/groups";

export default protectedPage({
  resolveParams: ({ groupId }) => ({
    redirectTo: groupId ? `/groups/${groupId}` : "/groups",
    groupId,
  }),

  getData: getGroups,
  children: <CliGroupsPage />,
  rewritePath: "/groups",
});
