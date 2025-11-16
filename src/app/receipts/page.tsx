import { svcGetGroups } from "../groups/_lib";

import wrapPage from "@/app/_lib/wrapPage";
import CliReceiptsPage from "./_components";

export default wrapPage({
  getData: (userId) => svcGetGroups(userId, { view: "receipts" }),
  children: <CliReceiptsPage />,
  rewritePath: "/receipts",
});
