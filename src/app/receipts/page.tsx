import { getReceipts } from "@/app/_lib/services/receipts";

import wrapPage from "@/app/_lib/wrapPage";
import CliReceiptsPage from "./_components";

export default wrapPage({
  getData: getReceipts,
  children: <CliReceiptsPage />,
  rewritePath: "/receipts",
});
