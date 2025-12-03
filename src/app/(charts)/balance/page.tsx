import wrapPage from "@/app/_lib/wrapPage";

import { svcGetGroups } from "@/app/groups/_lib";
import CliBalancePage from "@/app/(charts)/balance/_components";

export default wrapPage({
  getData: (userId) => svcGetGroups(userId, { extras: { balance: true } }),
  children: <CliBalancePage />,
  rewritePath: "/balance",
});
