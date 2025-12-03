import { svcAddUser } from "@/app/(users)/_lib";
import { svcAddCategory, svcModCategory } from "@/app/categories/_lib";
import { svcAddReceipt } from "@/app/receipts/_lib";

type AddUserParams = Parameters<typeof svcAddUser>[0];
type AddCategoryParams = Parameters<typeof svcAddCategory>;
type AddReceiptParams = Parameters<typeof svcAddReceipt>;
type ModCategoryParams = Parameters<typeof svcModCategory>;

const USERS: NonNullable<AddUserParams>[] = [
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

const CATEGORIES: {
  add: NonNullable<
    AddCategoryParams[1] & {
      revisedById: AddCategoryParams[0];
    }
  >[];

  mod: (ModCategoryParams[1] & {
    revisedById: ModCategoryParams[0];
  })[];
} = {
  add: [
    {
      revisedById: 1,
      groupId: 1,
      name: "food 1",
      description: "the vital stuff only",
    },
    {
      revisedById: 1,
      groupId: 1,
      name: "soft drinks 1",
      description: null,
    },
    {
      revisedById: 2,
      groupId: 1,
      name: "gas money 1",
      description: null,
    },
    {
      revisedById: 2,
      groupId: 1,
      name: "booze 1",
      description: "anything with alcohol in it 🥴",
    },

    // group 2
    { revisedById: 2, description: null, groupId: 2, name: "alcohol 2" },
    { revisedById: 3, description: null, groupId: 2, name: "gas money 2" },
    { revisedById: 3, description: null, groupId: 2, name: "something 2" },
    { revisedById: 3, description: null, groupId: 2, name: "rent 2" },

    // group 3
    { revisedById: 3, description: null, groupId: 3, name: "food 3" },
    { revisedById: 3, description: null, groupId: 3, name: "rent 3" },
  ],

  mod: [
    { revisedById: 1, id: 1, flags: 0 },
    { revisedById: 2, id: 1, flags: 1 },
    { revisedById: 2, id: 5, flags: 0 },
    { revisedById: 3, id: 5, flags: 1 },
  ],
};

const RECEIPTS: NonNullable<
  AddReceiptParams[1] & {
    revisedById: AddReceiptParams[0];
  }
>[] = [
  {
    revisedById: 1,
    groupId: 1,
    paidById: 3,
    paidOn: "2025-02-01",
    items: [
      {
        categoryId: 1,
        cost: 11,
        itemShares: [{ userId: 2, share: 1 }],
        notes: "",
      },
      {
        categoryId: 1,
        cost: 9,
        itemShares: [
          { userId: 1, share: 2 },
          { userId: 2, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 2,
        cost: 20,
        itemShares: [],
        notes: null,
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 1,
    paidById: 2,
    paidOn: "2025-02-04",
    items: [
      {
        categoryId: 3,
        cost: 5,
        itemShares: [{ userId: 3, share: 1 }],
        notes: "",
      },
      {
        categoryId: 1,
        cost: 13,
        itemShares: [
          { userId: 1, share: 1 },
          { userId: 2, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: 33,
        itemShares: [],
        notes: "",
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 1,
    paidById: 2,
    paidOn: "2025-02-07",
    items: [
      {
        categoryId: 3,
        cost: 5,
        itemShares: [{ userId: 3, share: 1 }],
        notes: "",
      },
      {
        categoryId: 1,
        cost: 13,
        itemShares: [
          { userId: 1, share: 1 },
          { userId: 2, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: 33,
        itemShares: [],
        notes: "",
      },
    ],
  },

  {
    revisedById: 3,
    groupId: 1,
    paidById: 2,
    paidOn: "2025-02-10",
    items: [
      {
        categoryId: 3,
        cost: 12,
        itemShares: [{ userId: 1, share: 1 }],
        notes: "",
      },
      {
        categoryId: 4,
        cost: 23,
        itemShares: [
          { userId: 1, share: 1 },
          { userId: 2, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: 45,
        itemShares: [],
        notes: "",
      },
    ],
  },

  // group 2

  {
    revisedById: 3,
    groupId: 1,
    paidById: 2,
    paidOn: "2025-02-04",
    items: [
      {
        categoryId: 5,
        cost: 2.99,
        itemShares: [{ userId: 2, share: 1 }],
        notes: "",
      },
      {
        categoryId: 6,
        cost: 22.99,
        itemShares: [
          { userId: 2, share: 1 },
          { userId: 3, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 7,
        cost: 45.99,
        itemShares: [],
        notes: "",
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 1,
    paidById: 3,
    paidOn: "2025-02-10",
    items: [
      {
        categoryId: 5,
        cost: 2.99,
        itemShares: [{ userId: 2, share: 1 }],
        notes: "",
      },
      {
        categoryId: 6,
        cost: 22.99,
        itemShares: [
          { userId: 2, share: 1 },
          { userId: 3, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 7,
        cost: 45.99,
        itemShares: [],
        notes: "",
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 2,
    paidById: 3,
    paidOn: "2025-02-14",
    items: [
      {
        categoryId: 5,
        cost: 22.99,
        itemShares: [{ userId: 2, share: 1 }],
        notes: "",
      },
      {
        categoryId: 6,
        cost: 53.99,
        itemShares: [
          { userId: 2, share: 1 },
          { userId: 3, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 7,
        cost: 11.99,
        itemShares: [],
        notes: "faaf",
      },
    ],
  },

  {
    revisedById: 3,
    groupId: 2,
    paidById: 2,
    paidOn: "2025-02-24",
    items: [
      {
        categoryId: 8,
        cost: 0.99,
        itemShares: [{ userId: 2, share: 1 }],
        notes: "",
      },
      {
        categoryId: 5,
        cost: 13.99,
        itemShares: [
          { userId: 2, share: 1 },
          { userId: 3, share: 1 },
        ],
        notes: "split 2-ways",
      },
      {
        categoryId: 7,
        cost: 13.99,
        itemShares: [],
        notes: "",
      },
    ],
  },

  {
    revisedById: 3,
    groupId: 3,
    paidById: 3,
    paidOn: "2025-02-27",
    items: [
      {
        categoryId: 10,
        cost: 40.99,
        itemShares: [],
        notes: "",
      },
      {
        categoryId: 9,
        cost: 21.99,
        itemShares: [],
        notes: "",
      },
      {
        categoryId: 9,
        cost: 0.99,
        itemShares: [],
        notes: "",
      },
    ],
  },
];

const fixtures = { USERS, CATEGORIES, RECEIPTS };

export default fixtures;
