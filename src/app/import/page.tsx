import { Item, ItemShare, Receipt, Revision, User } from "@/lib/models";
import ImportButton from "@/components/import-button";

export default async function ImportView() {
  const [users, revisions, receipts, items, itemShares] = await Promise.all([
    User.count(),
    Revision.count(),
    Receipt.count(),
    Item.count(),
    ItemShare.count(),
  ]);

  return (
    <>
      <h2>Import view</h2>
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
