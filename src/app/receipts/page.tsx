import { getReceiptsDataFor } from "@/lib/services/receipt";

import protectedPage, { TPage } from "@/lib/protectedPage";
import CliReceiptsPage from "@/components/receipts";

export const dynamic = "force-dynamic";

export default async function ReceiptsPage({ params }: TPage) {
  return protectedPage({
    params,
    getData: getReceiptsDataFor,
    children: <CliReceiptsPage />,
    rewritePath: "/receipts",
  });
}
