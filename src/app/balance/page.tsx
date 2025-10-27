import { getBalance } from "@/lib/services/balance";

import wrapPage from "@/lib/wrapPage";
import CliBalancePage from "@/components/charts/balance";

export default wrapPage({
  getData: getBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
