import { svcGetGroups } from "@/app/groups/_lib";

import { VDate } from "@/app/_lib/utils";
import wrapPage from "@/app/_lib/wrapPage";

import ConsumptionPage from "./_components";

let from: string;

export default wrapPage({
  getData(userId) {
    from = VDate.nMonthsAgo(3);
    return svcGetGroups(userId, { extras: { consumption: { from } } });
  },
  children: () => <ConsumptionPage {...{ from }} />,
  rewritePath: "/consumption",
});
