import { svcGetGroups } from "../groups/_lib";

import wrapPage from "@/app/_lib/wrapPage";
import ReceiptsPage from "./_components";

export default wrapPage({
  getData: (userId) => svcGetGroups(userId, { extras: { receipts: true } }),
  children: <ReceiptsPage />,
  rewritePath: "/receipts",
});
