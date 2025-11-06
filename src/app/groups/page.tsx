import { getGroups } from "@/app/_lib/services";

import wrapPage from "@/app/_lib/wrapPage";
import CliGroupsPage from "./_components";

export default wrapPage({
  resolveParams: ({ groupId }) => ({
    redirectTo: groupId ? `/groups/${groupId}` : "/groups",
    groupId,
  }),

  getData: getGroups,
  children: <CliGroupsPage />,
  rewritePath: "/groups",
});
