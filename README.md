![CI/CD](https://github.com/tomjtoth/saldo/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/tomjtoth/saldo/graph/badge.svg?token=WKBLAW4XKP)](https://codecov.io/gh/tomjtoth/saldo)

# Saldo

A _Work in Progress_ multi-user expense tracker supporting `one-to-many` sharing of items. The current version of the app is deployed [here](https://saldo.ttj.hu).

## Authentication

Currently relying 100% on OAuth by `next-auth`, storing the returned profile's name, image and email, keeping the former 2 in sync.

## Database

Custom `*.sql` migration files were handled originally by `Umzug` and now via a custom solution transactionally and with `PRAGMA foreign_keys = OFF`, but rolling back in case of violations (`PRAGMA foreign_key_check`).

### Drizzle

Seems to work, filtering junction tables is kind of tough.

- [x] shouldn't pull in 10s of MB dependencies.. docker image:
  - even w/o explicit sqlite3 274MB vs 261MB Sequelize vs 283MB Prisma
  - and I get 3.45.1 sqlite with JSONB
- [x] should work with the custom migrations solution
  - [x] can be synced/migrated during tests to in-memory db based on JS schema
- [x] should handle custom types as POJOs
- [x] should produce minimal amount of queries per query, duh? (unlike prisma...)
- [x] should handle calculated fields as POJOs
  - yes, they are implemented as additional virtual fields in the DB
  - extras fields can be included
  - but it doesn't solve the problem of manipulating statusInt
- [x] should catch typos in column names of nested queries
- [x] placeholders can be skipped with `sql\`raw sql\``
  - in retrospect the same could have been applied to Prisma

### Previous ORMs tried/tested

- Prisma

  - using `prisma/generate.sh` to generate types with relations.
    Running `npx prisma migrate resolve --applied 20250708_pre-prisma` is necessary before handling additional migrations via Prisma during development. **Discarded it** due to inefficient `getReceipts` queries (receiptIds passed by `?,?,?,... ?` to `notIn: knownIds` and the **separate** items query...)

- Mikro-ORM

  - could not bootstrap with Next.js

- custom ORM solution

  - gave up on the idea after 1 month of low-intensity development work, due to increasing concern with reliability

- better-sqlite3

  - database changes were not reflected in the numerous raw SQL queries throughout the app

- Sequelize
  - querying allows including non-existent columns
