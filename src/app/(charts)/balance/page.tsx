import { getBalance } from "@/lib/services/balance";

import wrapPage from "@/lib/wrapPage";
import CliBalancePage from "@/app/(charts)/balance/_components";

export default wrapPage({
  getData: getBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
