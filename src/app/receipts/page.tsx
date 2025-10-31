import { getReceipts } from "@/lib/services/receipts";

import wrapPage from "@/lib/wrapPage";
import CliReceiptsPage from "./_components";

export default wrapPage({
  getData: getReceipts,
  children: <CliReceiptsPage />,
  rewritePath: "/receipts",
});
