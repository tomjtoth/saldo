![CI/CD](https://github.com/tomjtoth/saldo/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/tomjtoth/saldo/graph/badge.svg?token=WKBLAW4XKP)](https://codecov.io/gh/tomjtoth/saldo)

# Saldo

A _Work in Progress_ multi-user expense tracker supporting `one-to-many` sharing of items. The current version of the app is deployed [here](https://saldo.ttj.hu).

## Database

Using `Sequelize` with raw `*.sql` migration files, handled previously by `Umzug` and now via a custom solution transactionally and with `PRAGMA foreign_keys = OFF`, but rolling back in case of violations (`PRAGMA foreign_key_check`).

### Prisma

Running `npx prisma migrate resolve --applied 0-pre-prisma` is necessary before the new Docker image can be run.
Or `docker run --volume ./data:/app/data $IMAGE_ID npx prisma migrate resolve --applied 0-pre-prisma`.
