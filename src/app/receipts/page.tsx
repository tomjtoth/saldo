import { getReceipts } from "@/lib/services/receipts";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliReceiptsPage from "@/components/receipts";

export const dynamic = "force-dynamic";

export default ({ params }: TPage) =>
  protectedPage({
    params,
    getData: getReceipts,
    children: <CliReceiptsPage />,
    rewritePath: "/receipts",
  });
