import wrapPage from "@/app/_lib/wrapPage";
import { getBalance } from "@/app/_lib/services";

import CliBalancePage from "@/app/(charts)/balance/_components";

export default wrapPage({
  getData: getBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
