import { getPareto } from "@/lib/services/pareto";

import { VDate } from "@/lib/utils";
import wrapPage from "@/lib/wrapPage";

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
