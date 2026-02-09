import wrapRoute from "@/app/_lib/wrapRoute";
import { truncateDb } from "@/app/_lib/db";
import { svcAddUser } from "@/app/(users)/_lib";
import { svcAddCategory, svcModCategory } from "@/app/categories/_lib";
import { svcAddGroup, svcAddMember } from "@/app/groups/_lib";
import { svcAddReceipt } from "@/app/receipts/_lib";
import fixtures from "./_lib/fixtures";

export const GET = wrapRoute({ requireSession: false }, async () => {
  await truncateDb();

  for (const user of fixtures.USERS) {
    const { id: uid } = await svcAddUser(user);

    await svcAddGroup(uid, {
      name:
        uid === 1
          ? "group for users 1-3"
          : uid === 2
          ? "group for users 2-3"
          : "just you",
    });

    // add everyone to user #1's group
    if (uid !== 1 && uid !== 4) await svcAddMember(1, uid);
    if (uid === 3) await svcAddMember(2, uid);
  }

  for (const { revisedById, ...data } of fixtures.CATEGORIES.add) {
    await svcAddCategory(revisedById, data);
  }

  for (const { revisedById, ...data } of fixtures.CATEGORIES.mod) {
    await svcModCategory(revisedById, data);
  }

  for (const { revisedById, ...data } of fixtures.RECEIPTS) {
    await svcAddReceipt(revisedById, data);
  }
});
