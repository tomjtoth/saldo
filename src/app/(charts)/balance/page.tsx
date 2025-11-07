import wrapPage from "@/app/_lib/wrapPage";

import { getBalance } from "./_lib";
import CliBalancePage from "@/app/(charts)/balance/_components";

export default wrapPage({
  getData: getBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
