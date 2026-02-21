import wrapPage from "@/app/_lib/wrapPage";
import { svcGetGroups } from "@/app/groups/_lib";
import { VDate } from "@/app/_lib/utils";

import ConsumptionPage from "./_components";

let from: string;

export default wrapPage({
  getData(userId) {
    from = VDate.toBuiltStr((date) =>
      date.minus({ months: 3 }).set({ day: 1 }),
    );
    return svcGetGroups(userId, { extras: { consumption: { from } } });
  },
  children: () => <ConsumptionPage {...{ from }} />,
  rewritePath: "/consumption",
});
