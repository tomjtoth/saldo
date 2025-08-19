import { getReceipts } from "@/lib/services/receipts";

import protectedPage from "@/lib/protectedPage";
import CliReceiptsPage from "@/components/receipts";

export default protectedPage({
  getData: getReceipts,
  children: <CliReceiptsPage />,
  rewritePath: "/receipts",
});
