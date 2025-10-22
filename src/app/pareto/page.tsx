import { getPareto } from "@/lib/services/pareto";

import { VDate } from "@/lib/utils";
import protectedPage from "@/lib/protectedPage";

import CliParetoPage from "@/components/charts/pareto";

let from: string;

export default protectedPage({
  getData: (userId) => {
    from = VDate.nMonthsAgo(3);
    return getPareto(userId, { from });
  },
  genChildren: () => <CliParetoPage {...{ from }} />,
  rewritePath: "/pareto",
});
