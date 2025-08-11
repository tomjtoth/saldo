![CI/CD](https://github.com/tomjtoth/saldo/actions/workflows/deploy.yml/badge.svg)
[![codecov](https://codecov.io/gh/tomjtoth/saldo/graph/badge.svg?token=WKBLAW4XKP)](https://codecov.io/gh/tomjtoth/saldo)

# Saldo

A _Work in Progress_ multi-user expense tracker supporting `one-to-many` sharing of items. The current version of the app is deployed [here](https://saldo.ttj.hu).

<<<<<<< HEAD
## Database

Using `Sequelize` with raw `*.sql` migration files, handled previously by `Umzug` and now via a custom solution transactionally and with `PRAGMA foreign_keys = OFF`, but rolling back in case of violations (`PRAGMA foreign_key_check`).
=======
## Custom ORM

After failing to rebase the whole DB schema via my semi-custom Sequlezie migrations handler, I decided to write my own ORM. When I figured my migration script was at fault, I already had the Updater and Inserter classes done, so I decided to proceed ~~wasting my time~~ learning more by writing a type-safer minimalistic alternative to Sequelize.

### Current state

Simpler `.prepare()`, `.get()` and `.all()` calls work, `.innerJoin()` and `.leftJoin()` also works, but attributes of junctions are inaccessible.
>>>>>>> better-sqlite3
