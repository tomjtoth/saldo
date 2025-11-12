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
      name: "food",
      description: "the vital stuff only",
    },
    {
      revisedById: 1,
      groupId: 1,
      name: "soft drinks",
      description: null,
    },
    {
      revisedById: 2,
      groupId: 1,
      name: "gas money",
      description: null,
    },
    {
      revisedById: 2,
      groupId: 1,
      name: "booze",
      description: "anything with alcohol in it 🥴",
    },

    // group 2
    { revisedById: 2, description: null, groupId: 2, name: "alkoholi" },
    { revisedById: 3, description: null, groupId: 2, name: "bensaraha" },
    { revisedById: 3, description: null, groupId: 2, name: "jotain" },
    { revisedById: 3, description: null, groupId: 2, name: "vuokra" },
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
    paidOn: "2020-02-01",
    items: [
      {
        categoryId: 1,
        cost: 11,
        itemShares: [{ userId: 2, share: 1 }],
        id: 0,
        notes: "",
      },
      {
        categoryId: 1,
        cost: 9,
        itemShares: [
          { userId: 1, share: 2 },
          { userId: 2, share: 1 },
        ],
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 2,
        cost: 20,
        itemShares: [],
        id: 0,
        notes: null,
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 1,
    paidById: 2,
    paidOn: "2020-02-04",
    items: [
      {
        categoryId: 3,
        cost: 5,
        itemShares: [{ userId: 3, share: 1 }],
        id: 0,
        notes: "",
      },
      {
        categoryId: 1,
        cost: 13,
        itemShares: [
          { userId: 1, share: 1 },
          { userId: 2, share: 1 },
        ],
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: 33,
        itemShares: [],
        id: 0,
        notes: "",
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 1,
    paidById: 2,
    paidOn: "2020-02-07",
    items: [
      {
        categoryId: 3,
        cost: 5,
        itemShares: [{ userId: 3, share: 1 }],
        id: 0,
        notes: "",
      },
      {
        categoryId: 1,
        cost: 13,
        itemShares: [
          { userId: 1, share: 1 },
          { userId: 2, share: 1 },
        ],
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: 33,
        itemShares: [],
        id: 0,
        notes: "",
      },
    ],
  },

  {
    revisedById: 3,
    groupId: 1,
    paidById: 2,
    paidOn: "2020-02-10",
    items: [
      {
        categoryId: 3,
        cost: 12,
        itemShares: [{ userId: 1, share: 1 }],
        id: 0,
        notes: "",
      },
      {
        categoryId: 4,
        cost: 23,
        itemShares: [
          { userId: 1, share: 1 },
          { userId: 2, share: 1 },
        ],
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 4,
        cost: 45,
        itemShares: [],
        id: 0,
        notes: "",
      },
    ],
  },

  // group 2

  {
    revisedById: 3,
    groupId: 1,
    paidById: 2,
    paidOn: "2020-02-04",
    items: [
      {
        categoryId: 5,
        cost: 2.99,
        itemShares: [{ userId: 2, share: 1 }],
        id: 0,
        notes: "",
      },
      {
        categoryId: 6,
        cost: 22.99,
        itemShares: [
          { userId: 2, share: 1 },
          { userId: 3, share: 1 },
        ],
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 7,
        cost: 45.99,
        itemShares: [],
        id: 0,
        notes: "",
      },
    ],
  },

  {
    revisedById: 2,
    groupId: 1,
    paidById: 3,
    paidOn: "2020-02-10",
    items: [
      {
        categoryId: 5,
        cost: 2.99,
        itemShares: [{ userId: 2, share: 1 }],
        id: 0,
        notes: "",
      },
      {
        categoryId: 6,
        cost: 22.99,
        itemShares: [
          { userId: 2, share: 1 },
          { userId: 3, share: 1 },
        ],
        id: 0,
        notes: "split 2-ways",
      },
      {
        categoryId: 7,
        cost: 45.99,
        itemShares: [],
        id: 0,
        notes: "",
      },
    ],
  },
];

export default { USERS, CATEGORIES, RECEIPTS };
