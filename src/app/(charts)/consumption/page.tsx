import { svcGetConsumption } from "./_lib";

import { VDate } from "@/app/_lib/utils";
import wrapPage from "@/app/_lib/wrapPage";

import CliConsumptionPage from "./_components";

let from: string;

export default wrapPage({
  getData(userId) {
    from = VDate.nMonthsAgo(3);
    return svcGetConsumption(userId, { from });
  },
  children: () => <CliConsumptionPage {...{ from }} />,
  rewritePath: "/consumption",
});
