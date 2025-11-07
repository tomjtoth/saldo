import { getReceipts } from "./_lib";

import wrapPage from "@/app/_lib/wrapPage";
import CliReceiptsPage from "./_components";

export default wrapPage({
  getData: getReceipts,
  children: <CliReceiptsPage />,
  rewritePath: "/receipts",
});
