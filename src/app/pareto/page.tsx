import { getParetoDataFor } from "@/lib/services/pareto";

import CliParetoPage from "@/components/pareto";
import protectedPage from "@/lib/protectedPage";

export const dynamic = "force-dynamic";

export default async ({ params }: { params: { groupId?: string } }) =>
  protectedPage({
    params,
    getData: getParetoDataFor,
    children: <CliParetoPage />,
    rewritePath: "/pareto",
  });
