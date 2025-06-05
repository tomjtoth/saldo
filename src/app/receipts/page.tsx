import Link from "next/link";

import Header from "@/components/header";

export default function ReceiptsPage() {
  return (
    <>
      <Header>
        <h2>Receipts</h2>
      </Header>

      <Link href="/receipts/new">Add new receipt</Link>
    </>
  );
}
