import { getBalance } from "@/lib/services/balance";

import protectedPage from "@/lib/protectedPage";
import CliBalancePage from "@/components/charts/balance";

export default protectedPage({
  getData: getBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
