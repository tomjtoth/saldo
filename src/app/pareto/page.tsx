import { getPareto } from "@/lib/services/pareto";

import protectedPage from "@/lib/protectedPage";
import CliParetoPage from "@/components/pareto";

export default protectedPage<{ from?: string; to?: string }>({
  getData: getPareto,
  genChildren: ({ groupId: _discard, ...interval }) => (
    <CliParetoPage {...interval} />
  ),
  rewritePath: "/pareto",
});
