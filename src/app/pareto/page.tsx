import { getPareto } from "@/lib/services/pareto";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliParetoPage from "@/components/pareto";

export const dynamic = "force-dynamic";

export default ({ params }: TPage) =>
  protectedPage({
    params,
    getData: getPareto,
    children: <CliParetoPage />,
    rewritePath: "/pareto",
  });
