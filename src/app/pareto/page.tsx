import { getParetoDataFor } from "@/lib/services/pareto";

import CliParetoPage from "@/components/pareto";
import protectedPage, { TPage } from "@/lib/protectedPage";

export const dynamic = "force-dynamic";

export default async ({ params }: TPage) =>
  protectedPage({
    params,
    getData: getParetoDataFor,
    children: <CliParetoPage />,
    rewritePath: "/pareto",
  });
