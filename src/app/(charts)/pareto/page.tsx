import { getPareto } from "@/app/_lib/services/pareto";

import { VDate } from "@/app/_lib/utils";
import wrapPage from "@/app/_lib/wrapPage";

import CliParetoPage from "./_components";

let from: string;

export default wrapPage({
  getData: (userId) => {
    from = VDate.nMonthsAgo(3);
    return getPareto(userId, { from });
  },
  children: () => <CliParetoPage {...{ from }} />,
  rewritePath: "/pareto",
});
