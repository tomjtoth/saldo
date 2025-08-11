![CI/CD](https://github.com/tomjtoth/saldo/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/tomjtoth/saldo/graph/badge.svg?token=WKBLAW4XKP)](https://codecov.io/gh/tomjtoth/saldo)

# Saldo

A _Work in Progress_ multi-user expense tracker supporting `one-to-many` sharing of items. The current version of the app is deployed [here](https://saldo.ttj.hu).

## Database

Using `Sequelize` with raw `*.sql` migration files, handled previously by `Umzug` and now via a custom solution transactionally and with `PRAGMA foreign_keys = OFF`, but rolling back in case of violations (`PRAGMA foreign_key_check`).

### NEXT ORM candidate

- [ ] should work with the custom migrations solution
- [ ] should handle custom types as POJOs
- [ ] should handle calculated fields as POJOs
- [ ] should produce minimal amount of queries per query, duh? (unlike prisma...)
- [ ] should catch typos in column names of nested queries
- [ ] shouldn't pull in 10..20+ MB dependencies..

### Prisma

Using `prisma/generate.sh` to generate types with relations.
Running `npx prisma migrate resolve --applied 20250708_pre-prisma` is necessary before handling additional migrations via Prisma during development.

#### DISCARDED

Due to inefficient getReceipts queries (receiptIds passed by `?,?,?,... ?` to `notIn: knownIds` and the **separate** items query...)
