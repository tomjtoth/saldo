export const COLS_WITH = {
  columns: {
    id: true,
    name: true,
    description: true,
    flags: true,
    uuid: true,
  },
  with: {
    memberships: {
      columns: { flags: true },
      with: {
        user: {
          columns: { name: true, id: true, email: true, flags: true },
        },
      },
    },
  },
} as const;
