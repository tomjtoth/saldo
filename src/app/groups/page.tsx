import { getGroupsDataFor } from "@/lib/services/groups";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliGroupsPage from "@/components/groups";

export const dynamic = "force-dynamic";

export default async ({ params }: TPage) =>
  protectedPage({
    params,
    resolveParams: ({ groupId }) => {
      const asNum = Number(groupId);

      return {
        redirectTo: groupId ? `/groups/${groupId}` : "/groups",
        groupId: isNaN(asNum) ? undefined : asNum,
      };
    },

    getData: getGroupsDataFor,
    children: <CliGroupsPage />,
    rewritePath: "/groups",
  });
