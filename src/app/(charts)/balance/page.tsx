import wrapPage from "@/app/_lib/wrapPage";

import { svcGetBalance } from "./_lib";
import CliBalancePage from "@/app/(charts)/balance/_components";

export default wrapPage({
  getData: svcGetBalance,
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
