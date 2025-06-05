import { Item, ItemShare, Receipt, Revision, User } from "@/lib/models";
import ImportButton from "@/components/import-button";
import Header from "@/components/header";

export const dynamic = "force-dynamic";

export default async function ImportPage() {
  const [users, revisions, receipts, items, itemShares] = await Promise.all([
    User.count(),
    Revision.count(),
    Receipt.count(),
    Item.count(),
    ItemShare.count(),
  ]);

  return (
    <>
      <Header>
        <h2>Import view</h2>
      </Header>

      <p>Current data in the DB:</p>
      <ul>
        <li>users: {users}</li>
        <li>revisions: {revisions}</li>
        <li>receipts: {receipts}</li>
        <li>items: {items}</li>
        <li>itemShares: {itemShares}</li>
      </ul>
      <ImportButton />
    </>
  );
}
