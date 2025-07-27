![CI/CD](https://github.com/tomjtoth/saldo/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/tomjtoth/saldo/graph/badge.svg?token=WKBLAW4XKP)](https://codecov.io/gh/tomjtoth/saldo)

# Saldo

A _Work in Progress_ multi-user expense tracker supporting `one-to-many` sharing of items. The current version of the app is deployed [here](https://saldo.ttj.hu).

## Prisma

Running `npx prisma migrate resolve --applied 0-pre-prisma` is necessary before the new Docker image can be run.
Or `docker run --volume ./data:/app/data $IMAGE_ID npx prisma migrate resolve --applied 0-pre-prisma`.
