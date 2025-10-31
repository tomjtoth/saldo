import { getBalance } from "@/app/_lib/services/balance";

import wrapPage from "@/app/_lib/wrapPage";
import CliBalancePage from "@/app/(charts)/balance/_components";

export default wrapPage({
  getData: getBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
