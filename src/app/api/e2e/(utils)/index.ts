import { createCategory } from "@/lib/services/categories";
import { addMember, createGroup } from "@/lib/services/groups";
import { createReceipt } from "@/lib/services/receipts";
import { addUser } from "@/lib/services/users";

type UserParams = Parameters<typeof addUser>[0];
type GroupParams = Parameters<typeof createGroup>;
type CategoryParams = Parameters<typeof createCategory>;
type ReceiptParams = Parameters<typeof createReceipt>;

type Args = Partial<{
  users: UserParams[];

  groups: (GroupParams[1] & {
    ownerId: GroupParams[0];
  })[];

  categories: (CategoryParams[1] & {
    addedBy: CategoryParams[0];
  })[];

  receipts: (ReceiptParams[1] & {
    addedBy: ReceiptParams[0];
  })[];
}>;

const FALLBACK_USERS: NonNullable<Args["users"]> = [
  { name: "user1", email: "user1@e2e.tests" },
  {
    name: "user2",
    email: "user2@e2e.tests",
  },
  {
    name: "user3",
    email: "user3@e2e.tests",
  },
];

const FALLBACK_CATEGORIES: NonNullable<Args["categories"]> = [
  {
    addedBy: 1,
    groupId: 1,
    name: "food",
    description: "the vital stuff only",
  },
  {
    addedBy: 1,
    groupId: 1,
    name: "soft drinks",
    description: null,
  },
  {
    addedBy: 2,
    groupId: 1,
    name: "gas money",
    description: null,
  },
  {
    addedBy: 2,
    groupId: 1,
    name: "booze",
    description: "anything with alcohol in it 🥴",
  },
];

const FALLBACK_RECEIPTS: NonNullable<Args["receipts"]> = [
  {
    addedBy: 1,
    groupId: 1,
    paidBy: 3,
    paidOn: "2020-02-01",
    items: [
      { categoryId: 1, cost: "11", shares: { 2: 1 }, id: 0, notes: "" },
      {
        categoryId: 1,
        cost: "9",
        shares: { 1: 1, 2: 1 },
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 2,
        cost: "20",
        shares: {},
        id: 0,
        notes: "",
      },
    ],
  },

  {
    addedBy: 2,
    groupId: 1,
    paidBy: 2,
    paidOn: "2020-02-04",
    items: [
      { categoryId: 3, cost: "5", shares: { 3: 1 }, id: 0, notes: "" },
      {
        categoryId: 1,
        cost: "13",
        shares: { 1: 1, 2: 1 },
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: "33",
        shares: {},
        id: 0,
        notes: "",
      },
    ],
  },

  {
    addedBy: 3,
    groupId: 1,
    paidBy: 2,
    paidOn: "2020-02-04",
    items: [
      { categoryId: 3, cost: "12", shares: { 1: 1 }, id: 0, notes: "" },
      {
        categoryId: 4,
        cost: "23",
        shares: { 1: 1, 2: 1 },
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: "45",
        shares: {},
        id: 0,
        notes: "",
      },
    ],
  },
];

export async function populateDb(args?: Args) {
  for (const user of args?.users ?? FALLBACK_USERS) {
    const { id: uid } = await addUser(user);

    await createGroup(uid, {
      name: uid === 1 ? "shared group of user #1" : "just you",
    });

    // add everyone to user #1's group
    if (uid != 1) await addMember(1, uid);
  }

  for (const { addedBy, ...data } of args?.categories ?? FALLBACK_CATEGORIES) {
    await createCategory(addedBy, data);
  }

  for (const { addedBy, ...data } of args?.receipts ?? FALLBACK_RECEIPTS) {
    await createReceipt(addedBy, data);
  }
}
