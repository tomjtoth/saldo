import { getBalance } from "@/lib/services/balance";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliBalancePage from "@/components/balance";

export const dynamic = "force-dynamic";

export default ({ params }: TPage) =>
  protectedPage({
    params,
    getData: getBalance,
    children: <CliBalancePage />,
    rewritePath: "/balance",
  });
