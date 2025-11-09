import { svcGetReceipts } from "./_lib";

import wrapPage from "@/app/_lib/wrapPage";
import CliReceiptsPage from "./_components";

export default wrapPage({
  getData: svcGetReceipts,
  children: <CliReceiptsPage />,
  rewritePath: "/receipts",
});
