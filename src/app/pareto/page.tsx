import { getPareto } from "@/lib/services/pareto";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliParetoPage from "@/components/pareto";

export default ({ params }: TPage) =>
  protectedPage({
    params,
    getData: getPareto,
    children: <CliParetoPage />,
    rewritePath: "/pareto",
  });
