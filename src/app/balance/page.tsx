import { getBalanceDataFor } from "@/lib/services/balance";

import protectedPage, { TCoreParams } from "@/lib/protectedPage";
import CliBalancePage from "@/components/balance";

export const dynamic = "force-dynamic";

export default async ({ params }: TCoreParams) =>
  protectedPage({
    params,
    getData: getBalanceDataFor,
    children: <CliBalancePage />,
    rewritePath: "/balance",
  });
